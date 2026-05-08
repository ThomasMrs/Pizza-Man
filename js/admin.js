(function () {
  const state = {
    pendingImport: null,
    filter: "all",
    orders: [],
  };

  const loginPanel = document.querySelector("#login-panel");
  const loginForm = document.querySelector("#login-form");
  const loginFeedback = document.querySelector("#login-feedback");
  const workspace = document.querySelector("#admin-workspace");
  const logoutButton = document.querySelector("#logout-button");
  const refreshOrdersButton = document.querySelector("#refresh-orders");
  const importPanel = document.querySelector("#import-panel");
  const importSummary = document.querySelector("#import-summary");
  const acceptImport = document.querySelector("#accept-import");
  const manualLink = document.querySelector("#manual-link");
  const manualImportButton = document.querySelector("#manual-import-button");
  const adminFeedback = document.querySelector("#admin-feedback");
  const ordersList = document.querySelector("#orders-list");
  const adminEmpty = document.querySelector("#admin-empty");
  const scheduleList = document.querySelector("#schedule-list");
  const scheduleEmpty = document.querySelector("#schedule-empty");
  const toolbar = document.querySelector(".admin-toolbar");

  async function init() {
    bindEvents();
    readImportFromUrl();
    await renderAuth();
    refreshIcons();
  }

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function bindEvents() {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const username = String(formData.get("username") || "").trim();
      const password = String(formData.get("password") || "");

      loginFeedback.textContent = "";

      if (!window.PizzaManDb || !PizzaManDb.isConfigured) {
        loginFeedback.textContent = "Connexion sécurisée indisponible. Vérifie la configuration Supabase.";
        return;
      }

      try {
        await PizzaManDb.signIn(username, password);
        loginFeedback.textContent = "";
        await renderAuth();
        return;
      } catch (error) {
        loginFeedback.textContent = "Identifiant ou mot de passe incorrect.";
      }
    });

    logoutButton.addEventListener("click", async () => {
      if (window.PizzaManDb && PizzaManDb.isConfigured) {
        try {
          await PizzaManDb.signOut();
        } catch (error) {
          setAdminFeedback("Déconnexion Supabase impossible.");
        }
      }

      await renderAuth();
    });

    refreshOrdersButton.addEventListener("click", renderOrders);

    acceptImport.addEventListener("click", async () => {
      if (!state.pendingImport) return;
      const added = await addOrder(state.pendingImport);
      if (!added) return;
      state.pendingImport = null;
      renderImportPanel();
      await renderOrders();
    });

    manualImportButton.addEventListener("click", () => {
      const order = parseOrderFromText(manualLink.value);
      if (!order) {
        setAdminFeedback("Lien de commande invalide.");
        return;
      }
      state.pendingImport = normalizeOrder(order);
      manualLink.value = "";
      renderImportPanel();
      setAdminFeedback("Commande détectée. Vérifie puis ajoute-la à la liste.");
    });

    toolbar.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;
      state.filter = button.dataset.filter;
      toolbar.querySelectorAll("button[data-filter]").forEach((filterButton) => {
        filterButton.classList.toggle("active", filterButton === button);
      });
      renderOrdersList();
    });

    ordersList.addEventListener("click", async (event) => {
      const copyButton = event.target.closest("button[data-copy-order]");
      const deleteButton = event.target.closest("button[data-delete-order]");

      if (copyButton) {
        const order = getOrder(copyButton.dataset.copyOrder);
        if (!order) return;
        try {
          await navigator.clipboard.writeText(PizzaMan.formatOrderMessage(order));
          setAdminFeedback("Message de commande copié.");
        } catch (error) {
          setAdminFeedback("Copie impossible automatiquement.");
        }
      }

      if (deleteButton) {
        await deleteOrder(deleteButton.dataset.deleteOrder);
        await renderOrders();
        setAdminFeedback("Commande supprimée.");
      }
    });

    ordersList.addEventListener("change", async (event) => {
      const select = event.target.closest("select[data-status-order]");
      const scheduleInput = event.target.closest("input[data-schedule-order]");

      if (select) {
        await updateOrderStatus(select.dataset.statusOrder, select.value);
        await renderOrders();
      }

      if (scheduleInput) {
        await updateOrderSchedule(scheduleInput.dataset.scheduleOrder, scheduleInput.value);
      }
    });

    scheduleList.addEventListener("change", async (event) => {
      const scheduleInput = event.target.closest("input[data-schedule-order]");
      if (!scheduleInput) return;
      await updateOrderSchedule(scheduleInput.dataset.scheduleOrder, scheduleInput.value);
    });
  }

  async function renderAuth() {
    let supabaseAuthenticated = false;

    if (window.PizzaManDb && PizzaManDb.isConfigured) {
      try {
        supabaseAuthenticated = Boolean(await PizzaManDb.getSession());
      } catch (error) {
        supabaseAuthenticated = false;
      }
    }

    const authenticated = supabaseAuthenticated;
    loginPanel.hidden = authenticated;
    workspace.hidden = !authenticated;

    if (authenticated) {
      renderImportPanel();
      await renderOrders();
    }
  }

  function readImportFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const encodedOrder = params.get("order");
    if (!encodedOrder) return;

    try {
      state.pendingImport = normalizeOrder(PizzaMan.decodeOrder(encodedOrder));
    } catch (error) {
      state.pendingImport = null;
    }
  }

  function parseOrderFromText(text) {
    const value = text.trim();
    if (!value) return null;

    try {
      const url = new URL(value, window.location.href);
      const encodedOrder = url.searchParams.get("order");
      return encodedOrder ? PizzaMan.decodeOrder(encodedOrder) : null;
    } catch (error) {
      try {
        return PizzaMan.decodeOrder(value);
      } catch (decodeError) {
        return null;
      }
    }
  }

  function normalizeOrder(order) {
    return {
      id: order.id || PizzaMan.createOrderId(),
      createdAt: order.createdAt || new Date().toISOString(),
      status: order.status || "À faire",
      customer: order.customer || {},
      items: Array.isArray(order.items)
        ? order.items.map((item) => ({
            ...item,
            extras: Array.isArray(item.extras) ? item.extras.slice(0, PizzaMan.business.maxExtrasPerPizza) : [],
          }))
        : [],
    };
  }

  function renderImportPanel() {
    importPanel.hidden = !state.pendingImport;
    if (!state.pendingImport) return;

    const customer = state.pendingImport.customer || {};
    importSummary.textContent = `${state.pendingImport.id} - ${customer.name || "Client non renseigné"} - ${PizzaMan.articleCount(
      state.pendingImport,
    )} article(s) - ${PizzaMan.formatMoney(PizzaMan.orderTotal(state.pendingImport))}`;
    refreshIcons();
  }

  async function addOrder(order) {
    const deliveryWarning = PizzaMan.deliveryMinimumWarning(order);
    if (deliveryWarning) {
      setAdminFeedback(deliveryWarning);
      return false;
    }

    try {
      await PizzaManDb.upsertOrder(order, { source: "pizzeria" });
      setAdminFeedback("Commande ajoutée à la liste.");
      return true;
    } catch (error) {
      setAdminFeedback("Ajout impossible dans Supabase. Vérifie la migration et la connexion Auth.");
    }

    return false;
  }

  function getOrder(id) {
    return state.orders.find((order) => order.id === id);
  }

  async function loadOrders() {
    try {
      return await PizzaManDb.listOrders();
    } catch (error) {
      setAdminFeedback("Lecture Supabase impossible.");
    }

    return [];
  }

  async function updateOrderStatus(id, status) {
    try {
      await PizzaManDb.updateOrderStatus(id, status);
    } catch (error) {
      setAdminFeedback("Modification du statut impossible.");
    }
  }

  async function updateOrderSchedule(id, plannedTime) {
    const order = getOrder(id);
    if (!order) return;

    const customer = { ...(order.customer || {}) };
    if (plannedTime) {
      customer.plannedTime = plannedTime;
    } else {
      delete customer.plannedTime;
    }

    try {
      await PizzaManDb.updateOrderCustomer(id, customer);

      state.orders = state.orders.map((storedOrder) => (storedOrder.id === id ? { ...storedOrder, customer } : storedOrder));
      renderSchedule();
      renderOrdersList();
      setAdminFeedback("Heure prévue mise à jour.");
    } catch (error) {
      setAdminFeedback("Modification de l'heure impossible.");
    }
  }

  async function deleteOrder(id) {
    try {
      await PizzaManDb.deleteOrder(id);
    } catch (error) {
      setAdminFeedback("Suppression impossible.");
    }
  }

  async function renderOrders() {
    state.orders = await loadOrders();
    renderSchedule();
    renderOrdersList();
  }

  function renderOrdersList() {
    const orders = state.orders.filter((order) => state.filter === "all" || order.status === state.filter);
    adminEmpty.hidden = orders.length > 0;
    ordersList.innerHTML = orders.map(renderOrderCard).join("");
    refreshIcons();
  }

  function renderSchedule() {
    const scheduledOrders = state.orders
      .filter((order) => order.status !== "Terminée")
      .sort(compareOrdersByTime);

    scheduleEmpty.hidden = scheduledOrders.length > 0;
    scheduleList.innerHTML = scheduledOrders.map(renderScheduleCard).join("");
    refreshIcons();
  }

  function compareOrdersByTime(a, b) {
    const aTime = timeToMinutes(PizzaMan.orderTimeValue(a));
    const bTime = timeToMinutes(PizzaMan.orderTimeValue(b));
    if (aTime !== bTime) return aTime - bTime;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }

  function timeToMinutes(time) {
    if (!time) return Number.MAX_SAFE_INTEGER;
    const [hours, minutes] = String(time).split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.MAX_SAFE_INTEGER;
    return hours * 60 + minutes;
  }

  function renderScheduleCard(order) {
    const customer = order.customer || {};
    const orderId = PizzaMan.escapeHtml(order.id);
    const time = PizzaMan.orderTimeValue(order);
    const timeLabel = PizzaMan.escapeHtml(PizzaMan.formatTimeLabel(time));
    const mode = PizzaMan.escapeHtml(customer.mode || "À emporter");
    const address = PizzaMan.escapeHtml(
      customer.address || (customer.mode === "Livraison" ? "Adresse non renseignée" : ""),
    );
    const name = PizzaMan.escapeHtml(customer.name || "Client non renseigné");
    const phone = PizzaMan.escapeHtml(customer.phone || "Téléphone non renseigné");

    return `
      <article class="schedule-card">
        <div class="schedule-time">
          <strong>${timeLabel}</strong>
          <input type="time" value="${PizzaMan.escapeHtml(time)}" data-schedule-order="${orderId}" aria-label="Heure prévue ${orderId}">
        </div>
        <div class="schedule-details">
          <h3>${name}</h3>
          <p>${mode}</p>
          ${address ? `<p>${address}</p>` : ""}
          <span>${phone}</span>
        </div>
        <div class="schedule-meta">
          <span>${PizzaMan.articleCount(order)} article(s)</span>
          <span>${PizzaMan.escapeHtml(order.status || "À faire")}</span>
          <strong>${PizzaMan.formatMoney(PizzaMan.orderTotal(order))}</strong>
        </div>
      </article>
    `;
  }

  function renderOrderCard(order) {
    const customer = order.customer || {};
    const date = new Date(order.createdAt);
    const dateLabel = Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
    const statusClass =
      order.status === "Prête" ? "status-ready" : order.status === "Terminée" ? "status-done" : "";

    const items = (order.items || [])
      .map(
        (item) =>
          `<li>${PizzaMan.escapeHtml(PizzaMan.itemSummary(item))} - ${PizzaMan.formatMoney(PizzaMan.itemTotal(item))}</li>`,
      )
      .join("");
    const orderId = PizzaMan.escapeHtml(order.id);
    const status = PizzaMan.escapeHtml(order.status || "À faire");
    const customerName = PizzaMan.escapeHtml(customer.name || "Client non renseigné");
    const customerPhone = PizzaMan.escapeHtml(customer.phone || "Téléphone non renseigné");
    const customerMode = PizzaMan.escapeHtml(customer.mode || "À emporter");
    const customerAddress = PizzaMan.escapeHtml(customer.address || "");
    const delivery = PizzaMan.deliveryCharge(order);
    const deliveryWarningMessage = PizzaMan.deliveryMinimumWarning(order);
    const deliveryWarning = deliveryWarningMessage ? `<p>${PizzaMan.escapeHtml(deliveryWarningMessage)}</p>` : "";

    return `
      <article class="order-card ${statusClass}">
        <div>
          <div class="order-meta">
            <span>${status}</span>
            <span>${PizzaMan.escapeHtml(dateLabel)}</span>
            <span>${PizzaMan.articleCount(order)} article(s)</span>
            <span>${PizzaMan.formatMoney(PizzaMan.orderTotal(order))}</span>
          </div>
          <h2>${orderId}</h2>
          <p>${customerName} - ${customerPhone}</p>
          <p>${customerMode}${customerAddress ? ` - ${customerAddress}` : ""}</p>
          ${customer.desiredTime ? `<p>Heure souhaitée: ${PizzaMan.formatTimeLabel(customer.desiredTime)}</p>` : ""}
          ${customer.plannedTime ? `<p>Heure prévue: ${PizzaMan.formatTimeLabel(customer.plannedTime)}</p>` : ""}
          <ul>${items}</ul>
          ${delivery ? `<p>Frais livraison: ${PizzaMan.formatMoney(delivery)}</p>` : ""}
          ${deliveryWarning}
        </div>
        <div class="order-actions">
          <select data-status-order="${orderId}" aria-label="Statut de ${orderId}">
            ${["À faire", "En préparation", "Prête", "Terminée"]
              .map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`)
              .join("")}
          </select>
          <label class="order-time-control">
            Heure prévue
            <input type="time" value="${PizzaMan.escapeHtml(PizzaMan.orderTimeValue(order))}" data-schedule-order="${orderId}">
          </label>
          <button class="secondary-action" type="button" data-copy-order="${orderId}">
            <i data-lucide="copy" aria-hidden="true"></i>
            Copier
          </button>
          <button class="secondary-action" type="button" data-delete-order="${orderId}">
            <i data-lucide="trash-2" aria-hidden="true"></i>
            Supprimer
          </button>
        </div>
      </article>
    `;
  }

  function setAdminFeedback(message) {
    adminFeedback.textContent = message;
    window.clearTimeout(setAdminFeedback.timeout);
    setAdminFeedback.timeout = window.setTimeout(() => {
      adminFeedback.textContent = "";
    }, 4200);
  }

  init();
})();
