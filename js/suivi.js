(function () {
  const POLL_INTERVAL_MS = 5000; // filet de sécurité si le temps réel n'est pas actif
  const STALE_AFTER_MS = 90000; // position considérée "en attente" après 1 min 30

  const titleEl = document.querySelector("#tracking-title");
  const noteEl = document.querySelector("#tracking-note");
  const etaWrap = document.querySelector("#tracking-eta");
  const etaClock = document.querySelector("#eta-clock");
  const etaRemaining = document.querySelector("#eta-remaining");
  const liveDot = document.querySelector("#live-dot");
  const mapsLink = document.querySelector("#maps-link");
  const mapEl = document.querySelector("#map");

  const state = {
    id: null,
    delivery: null,
    map: null,
    driverMarker: null,
    pizzaMarker: null,
    hasFitBounds: false,
    unsubscribe: null,
    pollTimer: null,
    tickTimer: null,
  };

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function emojiIcon(emoji, className) {
    return window.L.divIcon({
      className: "map-emoji " + (className || ""),
      html: `<span>${emoji}</span>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }

  function initMap() {
    const pizzeria = PizzaTracking.PIZZERIA;
    state.map = window.L.map(mapEl, { zoomControl: true, attributionControl: true }).setView(
      [pizzeria.lat, pizzeria.lng],
      14,
    );
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(state.map);

    state.pizzaMarker = window.L.marker([pizzeria.lat, pizzeria.lng], {
      icon: emojiIcon("🍕", "is-pizzeria"),
      title: pizzeria.name,
    }).addTo(state.map);
    state.pizzaMarker.bindPopup(pizzeria.name);

    // Corrige un éventuel décalage des tuiles après la mise en page.
    window.setTimeout(() => state.map.invalidateSize(), 200);
  }

  function setDriverPosition(lat, lng) {
    if (lat == null || lng == null) return;
    const latlng = [lat, lng];
    if (!state.driverMarker) {
      state.driverMarker = window.L.marker(latlng, {
        icon: emojiIcon("🛵", "is-driver"),
        title: "Votre livreur",
        zIndexOffset: 1000,
      }).addTo(state.map);
      state.driverMarker.bindPopup("Votre livreur");
    } else {
      state.driverMarker.setLatLng(latlng);
    }

    if (!state.hasFitBounds) {
      const pizzeria = PizzaTracking.PIZZERIA;
      const bounds = window.L.latLngBounds([latlng, [pizzeria.lat, pizzeria.lng]]);
      state.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      state.hasFitBounds = true;
    } else {
      state.map.panTo(latlng, { animate: true });
    }
  }

  function formatClock(date) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  function renderEta() {
    const delivery = state.delivery;
    if (!delivery || !delivery.started_at || !delivery.eta_minutes) {
      etaWrap.hidden = true;
      return;
    }
    if (delivery.status !== "en_route") {
      etaWrap.hidden = true;
      return;
    }

    const arrival = new Date(delivery.started_at).getTime() + delivery.eta_minutes * 60000;
    const remainingMs = arrival - Date.now();
    etaWrap.hidden = false;
    etaClock.textContent = formatClock(new Date(arrival));

    if (remainingMs <= 30000) {
      etaRemaining.textContent = "Arrivée imminente";
    } else {
      const minutes = Math.round(remainingMs / 60000);
      etaRemaining.textContent = `${minutes} min`;
    }
  }

  function renderStatus() {
    const delivery = state.delivery;
    if (!delivery) return;

    const name = delivery.client_name ? delivery.client_name : "";

    if (delivery.status === "arrived") {
      liveDot.classList.remove("is-live");
      titleEl.textContent = name ? `${name}, votre livreur est arrivé ! 🎉` : "Votre livreur est arrivé ! 🎉";
      noteEl.textContent = "Bon appétit 🍕";
      etaWrap.hidden = true;
      return;
    }

    if (delivery.status === "cancelled") {
      liveDot.classList.remove("is-live");
      titleEl.textContent = "Livraison annulée";
      noteEl.textContent = "Cette livraison a été annulée. Contactez la pizzeria au 06-46-57-63-69.";
      etaWrap.hidden = true;
      return;
    }

    // en_route
    liveDot.classList.add("is-live");
    titleEl.textContent = name ? `${name}, votre livreur est en route 🛵` : "Votre livreur est en route 🛵";

    const hasPosition = delivery.driver_lat != null && delivery.driver_lng != null;
    if (!hasPosition) {
      noteEl.textContent = "En attente de la position du livreur…";
      return;
    }

    const updatedAt = delivery.updated_at ? new Date(delivery.updated_at).getTime() : 0;
    const age = Date.now() - updatedAt;
    if (age > STALE_AFTER_MS) {
      noteEl.textContent = "Position en cours d'actualisation…";
    } else {
      noteEl.textContent = delivery.destination
        ? `En route vers : ${delivery.destination}`
        : "Suivez sa progression sur la carte ci-dessous.";
    }
  }

  function renderMapsLink() {
    const delivery = state.delivery;
    if (delivery && delivery.status === "en_route" && delivery.driver_lat != null && delivery.driver_lng != null) {
      mapsLink.hidden = false;
      mapsLink.href = PizzaTracking.googleMapsUrl(delivery.driver_lat, delivery.driver_lng);
    } else {
      mapsLink.hidden = true;
    }
  }

  function render() {
    renderStatus();
    renderEta();
    renderMapsLink();
    if (state.delivery && state.delivery.driver_lat != null && state.delivery.driver_lng != null) {
      setDriverPosition(state.delivery.driver_lat, state.delivery.driver_lng);
    }
    refreshIcons();
  }

  function applyDelivery(delivery) {
    if (!delivery) return;
    state.delivery = delivery;
    render();

    if (delivery.status !== "en_route") {
      stopUpdates();
    }
  }

  function stopUpdates() {
    if (state.unsubscribe) {
      state.unsubscribe();
      state.unsubscribe = null;
    }
    if (state.pollTimer) {
      window.clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
    if (state.tickTimer) {
      window.clearInterval(state.tickTimer);
      state.tickTimer = null;
    }
  }

  async function poll() {
    try {
      const delivery = await PizzaTracking.getDelivery(state.id);
      if (delivery) applyDelivery(delivery);
    } catch (error) {
      console.error(error);
    }
  }

  function showError(message) {
    titleEl.textContent = message;
    noteEl.textContent = "";
    liveDot.classList.remove("is-live");
    etaWrap.hidden = true;
    mapEl.hidden = true;
  }

  async function start() {
    state.id = getIdFromUrl();
    if (!state.id) {
      showError("Lien de suivi invalide.");
      return;
    }

    initMap();

    let delivery = null;
    try {
      delivery = await PizzaTracking.getDelivery(state.id);
    } catch (error) {
      console.error(error);
      showError("Connexion au suivi impossible. Réessaie dans un instant.");
      return;
    }

    if (!delivery) {
      showError("Livraison introuvable.");
      return;
    }

    applyDelivery(delivery);

    if (delivery.status === "en_route") {
      // Temps réel (instantané) + polling en filet de sécurité.
      try {
        state.unsubscribe = PizzaTracking.subscribe(state.id, applyDelivery);
      } catch (error) {
        console.error(error);
      }
      state.pollTimer = window.setInterval(poll, POLL_INTERVAL_MS);
      // Rafraîchit le compte à rebours même sans nouvelle position.
      state.tickTimer = window.setInterval(() => {
        renderStatus();
        renderEta();
      }, 15000);
    }
  }

  window.addEventListener("beforeunload", stopUpdates);

  start();
})();
