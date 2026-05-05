(function () {
  const state = {
    pendingImport: null,
    filter: "all",
  };

  const loginPanel = document.querySelector("#login-panel");
  const loginForm = document.querySelector("#login-form");
  const loginFeedback = document.querySelector("#login-feedback");
  const workspace = document.querySelector("#admin-workspace");
  const logoutButton = document.querySelector("#logout-button");
  const importPanel = document.querySelector("#import-panel");
  const importSummary = document.querySelector("#import-summary");
  const acceptImport = document.querySelector("#accept-import");
  const manualLink = document.querySelector("#manual-link");
  const manualImportButton = document.querySelector("#manual-import-button");
  const adminFeedback = document.querySelector("#admin-feedback");
  const ordersList = document.querySelector("#orders-list");
  const adminEmpty = document.querySelector("#admin-empty");
  const toolbar = document.querySelector(".admin-toolbar");

  function init() {
    bindEvents();
    readImportFromUrl();
    renderAuth();
    refreshIcons();
  }

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function bindEvents() {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const username = String(formData.get("username") || "");
      const password = String(formData.get("password") || "");

      if (username === PizzaMan.config.adminUsername && password === PizzaMan.config.adminPassword) {
        sessionStorage.setItem(PizzaMan.config.sessionKey, "1");
        loginFeedback.textContent = "";
        renderAuth();
        return;
      }

      loginFeedback.textContent = "Identifiant ou mot de passe incorrect.";
    });

    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem(PizzaMan.config.sessionKey);
      renderAuth();
    });

    acceptImport.addEventListener("click", () => {
      if (!state.pendingImport) return;
      addOrder(state.pendingImport);
      state.pendingImport = null;
      renderImportPanel();
      renderOrders();
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
      renderOrders();
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
        const orders = PizzaMan.loadOrders().filter((order) => order.id !== deleteButton.dataset.deleteOrder);
        PizzaMan.saveOrders(orders);
        renderOrders();
        setAdminFeedback("Commande supprimée.");
      }
    });

    ordersList.addEventListener("change", (event) => {
      const select = event.target.closest("select[data-status-order]");
      if (!select) return;
      const orders = PizzaMan.loadOrders().map((order) => {
        if (order.id !== select.dataset.statusOrder) return order;
        return { ...order, status: select.value };
      });
      PizzaMan.saveOrders(orders);
      renderOrders();
    });
  }

  function renderAuth() {
    const authenticated = sessionStorage.getItem(PizzaMan.config.sessionKey) === "1";
    loginPanel.hidden = authenticated;
    workspace.hidden = !authenticated;

    if (authenticated) {
      renderImportPanel();
      renderOrders();
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
      id: order.id || `PM-${Date.now()}`,
      createdAt: order.createdAt || new Date().toISOString(),
      status: order.status || "À faire",
      customer: order.customer || {},
      items: Array.isArray(order.items) ? order.items : [],
    };
  }

  function renderImportPanel() {
    importPanel.hidden = !state.pendingImport;
    if (!state.pendingImport) return;

    const customer = state.pendingImport.customer || {};
    importSummary.textContent = `${state.pendingImport.id} - ${customer.name || "Client non renseigné"} - ${
      state.pendingImport.items.length
    } pizza(s) - ${PizzaMan.formatMoney(PizzaMan.orderTotal(state.pendingImport))}`;
    refreshIcons();
  }

  function addOrder(order) {
    const orders = PizzaMan.loadOrders();
    if (orders.some((existingOrder) => existingOrder.id === order.id)) {
      setAdminFeedback("Cette commande est déjà dans la liste.");
      return;
    }

    PizzaMan.saveOrders([order, ...orders]);
    setAdminFeedback("Commande ajoutée à la liste.");
  }

  function getOrder(id) {
    return PizzaMan.loadOrders().find((order) => order.id === id);
  }

  function renderOrders() {
    const orders = PizzaMan.loadOrders().filter((order) => state.filter === "all" || order.status === state.filter);
    adminEmpty.hidden = orders.length > 0;
    ordersList.innerHTML = orders.map(renderOrderCard).join("");
    refreshIcons();
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

    return `
      <article class="order-card ${statusClass}">
        <div>
          <div class="order-meta">
            <span>${status}</span>
            <span>${PizzaMan.escapeHtml(dateLabel)}</span>
            <span>${PizzaMan.formatMoney(PizzaMan.orderTotal(order))}</span>
          </div>
          <h2>${orderId}</h2>
          <p>${customerName} - ${customerPhone}</p>
          <p>${customerMode}${customerAddress ? ` - ${customerAddress}` : ""}</p>
          <ul>${items}</ul>
        </div>
        <div class="order-actions">
          <select data-status-order="${orderId}" aria-label="Statut de ${orderId}">
            ${["À faire", "En préparation", "Prête", "Terminée"]
              .map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`)
              .join("")}
          </select>
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
