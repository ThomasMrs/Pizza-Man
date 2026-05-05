(function () {
  const state = {
    pendingImport: null,
    filter: "all",
    orders: [],
    localAuth: false,
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

      if (window.PizzaManDb && PizzaManDb.isConfigured) {
        try {
          await PizzaManDb.signIn(username, password);
          sessionStorage.removeItem(PizzaMan.config.sessionKey);
          state.localAuth = false;
          await renderAuth();
          return;
        } catch (error) {
          loginFeedback.textContent = "Connexion Supabase impossible. Vérifie l'utilisateur Auth ou utilise l'accès local.";
        }
      }

      if (username === PizzaMan.config.adminUsername && password === PizzaMan.config.adminPassword) {
        sessionStorage.setItem(PizzaMan.config.sessionKey, "1");
        state.localAuth = true;
        loginFeedback.textContent = "";
        await renderAuth();
        return;
      }

      if (!loginFeedback.textContent) {
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

      sessionStorage.removeItem(PizzaMan.config.sessionKey);
      state.localAuth = false;
      await renderAuth();
    });

    refreshOrdersButton.addEventListener("click", renderOrders);

    acceptImport.addEventListener("click", async () => {
      if (!state.pendingImport) return;
      await addOrder(state.pendingImport);
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
      if (!select) return;
      await updateOrderStatus(select.dataset.statusOrder, select.value);
      await renderOrders();
    });
  }

  async function renderAuth() {
    const localAuthenticated = sessionStorage.getItem(PizzaMan.config.sessionKey) === "1";
    let supabaseAuthenticated = false;

    if (window.PizzaManDb && PizzaManDb.isConfigured) {
      try {
        supabaseAuthenticated = Boolean(await PizzaManDb.getSession());
      } catch (error) {
        supabaseAuthenticated = false;
      }
    }

    state.localAuth = localAuthenticated && !supabaseAuthenticated;
    const authenticated = localAuthenticated || supabaseAuthenticated;
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
      items: Array.isArray(order.items) ? order.items : [],
    };
  }

  function renderImportPanel() {
    importPanel.hidden = !state.pendingImport;
    if (!state.pendingImport) return;

    const customer = state.pendingImport.customer || {};
    importSummary.textContent = `${state.pendingImport.id} - ${customer.name || "Client non renseigné"} - ${
      state.pendingImport.items.length
    } article(s) - ${PizzaMan.formatMoney(PizzaMan.orderTotal(state.pendingImport))}`;
    refreshIcons();
  }

  async function addOrder(order) {
    try {
      if (window.PizzaManDb && PizzaManDb.isConfigured && !state.localAuth) {
        await PizzaManDb.upsertOrder(order, { source: "pizzeria" });
      } else {
        const orders = PizzaMan.loadOrders();
        const nextOrders = [order, ...orders.filter((existingOrder) => existingOrder.id !== order.id)];
        PizzaMan.saveOrders(nextOrders);
      }
      setAdminFeedback("Commande ajoutée à la liste.");
    } catch (error) {
      setAdminFeedback("Ajout impossible dans Supabase. Vérifie la migration et la connexion Auth.");
    }
  }

  function getOrder(id) {
    return state.orders.find((order) => order.id === id);
  }

  async function loadOrders() {
    try {
      if (window.PizzaManDb && PizzaManDb.isConfigured && !state.localAuth) {
        return await PizzaManDb.listOrders();
      }
    } catch (error) {
      setAdminFeedback("Lecture Supabase impossible. Affichage des commandes locales.");
    }

    return PizzaMan.loadOrders();
  }

  async function updateOrderStatus(id, status) {
    try {
      if (window.PizzaManDb && PizzaManDb.isConfigured && !state.localAuth) {
        await PizzaManDb.updateOrderStatus(id, status);
      } else {
        const orders = PizzaMan.loadOrders().map((order) => (order.id === id ? { ...order, status } : order));
        PizzaMan.saveOrders(orders);
      }
    } catch (error) {
      setAdminFeedback("Modification du statut impossible.");
    }
  }

  async function deleteOrder(id) {
    try {
      if (window.PizzaManDb && PizzaManDb.isConfigured && !state.localAuth) {
        await PizzaManDb.deleteOrder(id);
      } else {
        PizzaMan.saveOrders(PizzaMan.loadOrders().filter((order) => order.id !== id));
      }
    } catch (error) {
      setAdminFeedback("Suppression impossible.");
    }
  }

  async function renderOrders() {
    state.orders = await loadOrders();
    renderOrdersList();
  }

  function renderOrdersList() {
    const orders = state.orders.filter((order) => state.filter === "all" || order.status === state.filter);
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
    const delivery = PizzaMan.deliveryCharge(order);
    const deliveryWarning =
      customer.mode === "Livraison" && PizzaMan.pizzaCount(order) < PizzaMan.business.deliveryMinimum
        ? `<p>Attention: livraison à partir de ${PizzaMan.business.deliveryMinimum} pizzas.</p>`
        : "";

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
          ${delivery ? `<p>Frais livraison: ${PizzaMan.formatMoney(delivery)}</p>` : ""}
          ${deliveryWarning}
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
