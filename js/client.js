(function () {
  const state = {
    cart: [],
    selectedPizzaId: null,
    editingIndex: null,
    selectedSize: "small",
    selectedExtras: new Set(),
    quantity: 1,
    orderMeta: null,
  };

  const menuGrid = document.querySelector("#menu-grid");
  const emptyCart = document.querySelector("#empty-cart");
  const cartItems = document.querySelector("#cart-items");
  const cartTotal = document.querySelector("#cart-total");
  const cartCount = document.querySelector("#cart-count");
  const customerForm = document.querySelector("#customer-form");
  const messageOutput = document.querySelector("#message-output");
  const copyMessageButton = document.querySelector("#copy-message");
  const copyOrderLinkButton = document.querySelector("#copy-order-link");
  const whatsappLink = document.querySelector("#whatsapp-link");
  const smsLink = document.querySelector("#sms-link");
  const feedback = document.querySelector("#client-feedback");
  const mobileCartJump = document.querySelector("#mobile-cart-jump");
  const mobileCartLabel = document.querySelector("#mobile-cart-label");
  const dialog = document.querySelector("#pizza-dialog");
  const pizzaForm = document.querySelector("#pizza-form");
  const dialogImage = document.querySelector("#dialog-image");
  const dialogTitle = document.querySelector("#dialog-title");
  const dialogDescription = document.querySelector("#dialog-description");
  const sizeField = document.querySelector(".segmented-field");
  const sizeControl = document.querySelector("#size-control");
  const extrasGrid = document.querySelector("#extras-grid");
  const extrasField = extrasGrid.closest("fieldset");
  const modificationInput = document.querySelector("#modification-input");
  const modificationLabel = modificationInput.closest("label");
  const quantityValue = document.querySelector("#quantity-value");
  const qtyMinus = document.querySelector("#qty-minus");
  const qtyPlus = document.querySelector("#qty-plus");
  const dialogPrice = document.querySelector("#dialog-price");
  const closeDialogButton = document.querySelector(".close-dialog");

  function init() {
    renderMenu();
    renderCart();
    bindEvents();
    refreshIcons();
  }

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function renderMenu() {
    const categories = PizzaMan.menu.reduce((groups, item) => {
      const category = item.category || "Carte";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(item);
      return groups;
    }, new Map());

    menuGrid.innerHTML = Array.from(categories.entries())
      .map(([category, items]) => {
        const cards = items.map(renderMenuCard).join("");
        return `
          <section class="menu-category">
            <div class="menu-category-heading">
              <h3>${PizzaMan.escapeHtml(category)}</h3>
              <span>${items.length} article(s)</span>
            </div>
            <div class="category-grid">
              ${cards}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function renderMenuCard(item) {
    const name = PizzaMan.escapeHtml(item.name);
    const description = PizzaMan.escapeHtml(item.description);
    const price = PizzaMan.formatPriceRange(item);
    const canCustomize =
      PizzaMan.getAvailableSizes(item).length > 1 || PizzaMan.allowsExtras(item) || PizzaMan.allowsModification(item);
    const imageAlt = item.type === "drink" ? name : `Pizza ${name}`;

    return `
      <article class="pizza-card">
        <img src="${PizzaMan.escapeHtml(item.image)}" alt="${imageAlt}" loading="lazy">
        <div class="pizza-card-body">
          <div class="pizza-card-title">
            <h3>${name}</h3>
            <span class="price-pill">${price}</span>
          </div>
          <p>${description}</p>
          <div class="pizza-actions ${canCustomize ? "" : "single-action"}">
            ${
              canCustomize
                ? `<button class="icon-button" type="button" data-edit-pizza="${PizzaMan.escapeHtml(
                    item.id,
                  )}" aria-label="Personnaliser ${name}">
                    <i data-lucide="pencil" aria-hidden="true"></i>
                  </button>`
                : ""
            }
            <button class="primary-action" type="button" data-add-pizza="${PizzaMan.escapeHtml(item.id)}">
              <i data-lucide="plus" aria-hidden="true"></i>
              Ajouter
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderSizeControl(item) {
    const sizes = PizzaMan.getAvailableSizes(item);
    const labeledSizes = sizes.filter((size) => PizzaMan.sizeLabel(size, item));
    sizeField.hidden = labeledSizes.length <= 1;
    sizeControl.innerHTML = labeledSizes
      .map(
        (size) => `
          <button type="button" data-size="${size}">
            ${PizzaMan.sizeLabel(size, item)}
          </button>
        `,
      )
      .join("");
  }

  function renderExtras(item) {
    const showExtras = PizzaMan.allowsExtras(item);
    extrasField.hidden = !showExtras;
    if (!showExtras) {
      extrasGrid.innerHTML = "";
      return;
    }

    const price = PizzaMan.formatMoney(PizzaMan.supplementPrice(state.selectedSize));
    extrasGrid.innerHTML = PizzaMan.extras
      .map(
        (extra) => `
          <label class="extra-option">
            <input type="checkbox" value="${PizzaMan.escapeHtml(extra.id)}">
            <span>${PizzaMan.escapeHtml(extra.name)} +${price}</span>
          </label>
        `,
      )
      .join("");
  }

  function bindEvents() {
    menuGrid.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-add-pizza], button[data-edit-pizza]");
      if (!button) return;
      openDialog(button.dataset.addPizza || button.dataset.editPizza);
    });

    sizeControl.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-size]");
      if (!button) return;
      state.selectedSize = button.dataset.size;
      const item = PizzaMan.getMenuItem(state.selectedPizzaId);
      renderExtras(item);
      updateDialogState();
    });

    extrasGrid.addEventListener("change", () => {
      state.selectedExtras = new Set(
        Array.from(extrasGrid.querySelectorAll("input:checked")).map((input) => input.value),
      );
      updateDialogState();
    });

    modificationInput.addEventListener("input", updateDialogState);

    qtyMinus.addEventListener("click", () => {
      state.quantity = Math.max(1, state.quantity - 1);
      updateDialogState();
    });

    qtyPlus.addEventListener("click", () => {
      state.quantity += 1;
      updateDialogState();
    });

    pizzaForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveDialogItem();
    });

    closeDialogButton.addEventListener("click", () => {
      dialog.close();
    });

    cartItems.addEventListener("click", (event) => {
      const editButton = event.target.closest("button[data-edit-item]");
      const removeButton = event.target.closest("button[data-remove-item]");

      if (editButton) {
        openDialog(state.cart[Number(editButton.dataset.editItem)].pizzaId, Number(editButton.dataset.editItem));
      }

      if (removeButton) {
        state.cart.splice(Number(removeButton.dataset.removeItem), 1);
        renderCart();
      }
    });

    customerForm.addEventListener("input", renderCart);
    copyMessageButton.addEventListener("click", copyMessage);
    copyOrderLinkButton.addEventListener("click", copyPizzeriaLink);
    whatsappLink.addEventListener("click", (event) => sendMessageLink(event, "whatsapp"));
    smsLink.addEventListener("click", (event) => sendMessageLink(event, "sms"));

    mobileCartJump.addEventListener("click", () => {
      document.querySelector("#commande").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function openDialog(pizzaId, editingIndex = null) {
    const item = PizzaMan.getMenuItem(pizzaId);
    if (!item) return;

    const existing = editingIndex !== null ? state.cart[editingIndex] : null;
    state.selectedPizzaId = pizzaId;
    state.editingIndex = editingIndex;
    state.selectedSize = existing ? existing.size : PizzaMan.getDefaultSize(item);
    state.selectedExtras = new Set(existing ? existing.extras || [] : []);
    state.quantity = existing ? existing.quantity : 1;
    modificationInput.value = existing ? existing.modification || "" : "";

    dialogImage.src = item.image;
    dialogImage.alt = item.type === "drink" ? item.name : `Pizza ${item.name}`;
    dialogTitle.textContent = item.name;
    dialogDescription.textContent = item.description;

    renderSizeControl(item);
    renderExtras(item);
    updateDialogState();
    dialog.showModal();
    refreshIcons();
  }

  function updateDialogState() {
    const item = PizzaMan.getMenuItem(state.selectedPizzaId);
    if (!item) return;

    if (!PizzaMan.allowsExtras(item)) {
      state.selectedExtras.clear();
    }

    if (!PizzaMan.allowsModification(item)) {
      modificationInput.value = "";
    }

    modificationLabel.hidden = !PizzaMan.allowsModification(item);

    Array.from(sizeControl.querySelectorAll("button[data-size]")).forEach((button) => {
      button.classList.toggle("active", button.dataset.size === state.selectedSize);
    });

    Array.from(extrasGrid.querySelectorAll("input")).forEach((input) => {
      input.checked = state.selectedExtras.has(input.value);
    });

    quantityValue.textContent = state.quantity;
    const tempItem = {
      pizzaId: state.selectedPizzaId,
      size: state.selectedSize,
      extras: Array.from(state.selectedExtras),
      modification: modificationInput.value.trim(),
      quantity: state.quantity,
    };
    dialogPrice.textContent = PizzaMan.formatMoney(PizzaMan.itemTotal(tempItem));
  }

  function saveDialogItem() {
    const itemData = PizzaMan.getMenuItem(state.selectedPizzaId);
    const item = {
      pizzaId: state.selectedPizzaId,
      size: state.selectedSize,
      extras: PizzaMan.allowsExtras(itemData) ? Array.from(state.selectedExtras) : [],
      modification: PizzaMan.allowsModification(itemData) ? modificationInput.value.trim() : "",
      quantity: state.quantity,
    };

    if (state.editingIndex !== null) {
      state.cart[state.editingIndex] = item;
    } else {
      state.cart.push(item);
    }

    dialog.close();
    renderCart();
  }

  function getCustomer() {
    const formData = new FormData(customerForm);
    return {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      mode: String(formData.get("mode") || "À emporter"),
      desiredTime: String(formData.get("desiredTime") || "").trim(),
      address: String(formData.get("address") || "").trim(),
    };
  }

  function getCurrentOrder() {
    if (state.cart.length && !state.orderMeta) {
      const now = new Date();
      state.orderMeta = {
        id: PizzaMan.createOrderId(now),
        createdAt: now.toISOString(),
      };
    }

    return PizzaMan.createOrder(state.cart, getCustomer(), state.orderMeta || {});
  }

  function renderCart() {
    if (!state.cart.length) {
      state.orderMeta = null;
    }

    emptyCart.hidden = state.cart.length > 0;
    cartItems.innerHTML = state.cart
      .map((item, index) => {
        const menuItem = PizzaMan.getMenuItem(item.pizzaId);
        const extras = (item.extras || [])
          .map((extraId) => PizzaMan.getExtra(extraId))
          .filter(Boolean)
          .map((extra) => extra.name)
          .join(", ");
        const itemName = PizzaMan.escapeHtml(menuItem ? menuItem.name : "Article");
        const size = PizzaMan.escapeHtml(PizzaMan.sizeLabel(item.size, menuItem));
        const extrasLabel = PizzaMan.escapeHtml(extras);
        const modification = PizzaMan.escapeHtml(item.modification || "");
        const details = [size, extrasLabel ? `Suppléments: ${extrasLabel}` : ""].filter(Boolean).join(" - ");
        return `
          <article class="cart-item">
            <div class="cart-item-head">
              <div>
                <h3>${item.quantity}x ${itemName}</h3>
                ${details ? `<p>${details}</p>` : ""}
              </div>
              <strong>${PizzaMan.formatMoney(PizzaMan.itemTotal(item))}</strong>
            </div>
            ${modification ? `<p>Modification: ${modification}</p>` : ""}
            <div class="cart-item-actions">
              <button class="icon-button" type="button" data-edit-item="${index}" aria-label="Modifier cet article">
                <i data-lucide="pencil" aria-hidden="true"></i>
              </button>
              <button class="icon-button" type="button" data-remove-item="${index}" aria-label="Retirer cet article">
                <i data-lucide="trash-2" aria-hidden="true"></i>
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    const order = getCurrentOrder();
    const total = PizzaMan.orderTotal(order);
    const pizzeriaLink = state.cart.length > 0 ? PizzaMan.buildPizzeriaLink(order) : "";
    const clientMessage =
      state.cart.length > 0
        ? `${PizzaMan.formatOrderMessage(order)}\n\nLien pizzeria: ${pizzeriaLink}`
        : "Ajoute un article pour générer le message de commande.";
    cartTotal.textContent = PizzaMan.formatMoney(total);
    messageOutput.value = clientMessage;

    const encodedMessage = encodeURIComponent(messageOutput.value);
    whatsappLink.href = state.cart.length > 0 ? `${PizzaMan.business.whatsappHref}?text=${encodedMessage}` : "#";
    smsLink.href = state.cart.length > 0 ? `${PizzaMan.business.smsHref}?&body=${encodedMessage}` : "#";
    const articleCount = PizzaMan.articleCount(order);
    cartCount.textContent = `${articleCount} article${articleCount > 1 ? "s" : ""}`;
    mobileCartLabel.textContent =
      articleCount > 0 ? `${articleCount} article(s) - ${PizzaMan.formatMoney(total)}` : "Voir la commande";

    refreshIcons();
  }

  async function persistCurrentOrder() {
    if (!state.cart.length) {
      setFeedback("Ajoute au moins un article avant d'envoyer la commande.");
      return null;
    }

    const order = getCurrentOrder();

    try {
      if (window.PizzaManDb) {
        await PizzaManDb.saveOrder(order);
      }
      return { order, stored: true };
    } catch (error) {
      setFeedback("Commande prête, mais l'enregistrement Supabase n'est pas encore disponible.");
    }

    return { order, stored: false };
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(successMessage);
    } catch (error) {
      setFeedback("Copie impossible automatiquement. Sélectionne le texte et copie-le manuellement.");
    }
  }

  async function copyMessage() {
    const result = await persistCurrentOrder();
    if (!result) return;
    copyText(
      messageOutput.value,
      result.stored ? "Message copié et commande enregistrée." : "Message copié. Supabase à vérifier.",
    );
  }

  async function copyPizzeriaLink() {
    const result = await persistCurrentOrder();
    if (!result) return;
    const link = PizzaMan.buildPizzeriaLink(getCurrentOrder());
    copyText(
      link,
      result.stored ? "Lien pizzeria copié et commande enregistrée." : "Lien pizzeria copié. Supabase à vérifier.",
    );
  }

  async function sendMessageLink(event, target) {
    if (!state.cart.length) {
      event.preventDefault();
      setFeedback("Ajoute au moins un article avant d'envoyer la commande.");
      return;
    }

    event.preventDefault();
    const popup = target === "whatsapp" ? window.open("about:blank", "_blank", "noreferrer") : null;
    const result = await persistCurrentOrder();
    if (!result) {
      if (popup) popup.close();
      return;
    }

    const href = target === "whatsapp" ? whatsappLink.href : smsLink.href;
    if (popup) {
      popup.location.href = href;
      return;
    }

    window.location.href = href;
  }

  function setFeedback(message) {
    feedback.textContent = message;
    window.clearTimeout(setFeedback.timeout);
    setFeedback.timeout = window.setTimeout(() => {
      feedback.textContent = "";
    }, 4200);
  }

  init();
})();
