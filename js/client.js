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
  const sizeControl = document.querySelector("#size-control");
  const extrasGrid = document.querySelector("#extras-grid");
  const modificationInput = document.querySelector("#modification-input");
  const quantityValue = document.querySelector("#quantity-value");
  const qtyMinus = document.querySelector("#qty-minus");
  const qtyPlus = document.querySelector("#qty-plus");
  const dialogPrice = document.querySelector("#dialog-price");
  const closeDialogButton = document.querySelector(".close-dialog");

  function init() {
    renderMenu();
    renderSizeControl();
    renderExtras();
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
    menuGrid.innerHTML = PizzaMan.menu
      .map((pizza) => {
        const price = `${PizzaMan.formatMoney(pizza.prices.small)} / ${PizzaMan.formatMoney(
          pizza.prices.large,
        )}`;
        const name = PizzaMan.escapeHtml(pizza.name);
        const description = PizzaMan.escapeHtml(pizza.description);
        return `
          <article class="pizza-card">
            <img src="${PizzaMan.escapeHtml(pizza.image)}" alt="Pizza ${name}" loading="lazy">
            <div class="pizza-card-body">
              <div class="pizza-card-title">
                <h3>${name}</h3>
                <span class="price-pill">${price}</span>
              </div>
              <p>${description}</p>
              <div class="pizza-actions">
                <button class="icon-button" type="button" data-edit-pizza="${PizzaMan.escapeHtml(
                  pizza.id,
                )}" aria-label="Modifier ${name}">
                  <i data-lucide="pencil" aria-hidden="true"></i>
                </button>
                <button class="primary-action" type="button" data-add-pizza="${PizzaMan.escapeHtml(pizza.id)}">
                  <i data-lucide="plus" aria-hidden="true"></i>
                  Ajouter
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderSizeControl() {
    sizeControl.innerHTML = `
      <button type="button" data-size="small">Petite</button>
      <button type="button" data-size="large">Grande</button>
    `;
  }

  function renderExtras() {
    extrasGrid.innerHTML = PizzaMan.extras
      .map(
        (extra) => `
          <label class="extra-option">
            <input type="checkbox" value="${PizzaMan.escapeHtml(extra.id)}">
            <span>${PizzaMan.escapeHtml(extra.name)} +${PizzaMan.formatMoney(extra.price)}</span>
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
      updateDialogState();
    });

    extrasGrid.addEventListener("change", () => {
      state.selectedExtras = new Set(
        Array.from(extrasGrid.querySelectorAll("input:checked")).map((input) => input.value),
      );
      updateDialogState();
    });

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

    mobileCartJump.addEventListener("click", () => {
      document.querySelector("#commande").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function openDialog(pizzaId, editingIndex = null) {
    const pizza = PizzaMan.getPizza(pizzaId);
    if (!pizza) return;

    const existing = editingIndex !== null ? state.cart[editingIndex] : null;
    state.selectedPizzaId = pizzaId;
    state.editingIndex = editingIndex;
    state.selectedSize = existing ? existing.size : "small";
    state.selectedExtras = new Set(existing ? existing.extras : []);
    state.quantity = existing ? existing.quantity : 1;
    modificationInput.value = existing ? existing.modification : "";

    dialogImage.src = pizza.image;
    dialogImage.alt = `Pizza ${pizza.name}`;
    dialogTitle.textContent = pizza.name;
    dialogDescription.textContent = pizza.description;

    updateDialogState();
    dialog.showModal();
    refreshIcons();
  }

  function updateDialogState() {
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
    const item = {
      pizzaId: state.selectedPizzaId,
      size: state.selectedSize,
      extras: Array.from(state.selectedExtras),
      modification: modificationInput.value.trim(),
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
        const pizza = PizzaMan.getPizza(item.pizzaId);
        const extras = item.extras
          .map((extraId) => PizzaMan.getExtra(extraId))
          .filter(Boolean)
          .map((extra) => extra.name)
          .join(", ");
        const pizzaName = PizzaMan.escapeHtml(pizza ? pizza.name : "Pizza");
        const extrasLabel = PizzaMan.escapeHtml(extras);
        const modification = PizzaMan.escapeHtml(item.modification || "");
        return `
          <article class="cart-item">
            <div class="cart-item-head">
              <div>
                <h3>${item.quantity}x ${pizzaName}</h3>
                <p>${PizzaMan.sizeLabel(item.size)}${extrasLabel ? ` - ${extrasLabel}` : ""}</p>
              </div>
              <strong>${PizzaMan.formatMoney(PizzaMan.itemTotal(item))}</strong>
            </div>
            ${modification ? `<p>Modification: ${modification}</p>` : ""}
            <div class="cart-item-actions">
              <button class="icon-button" type="button" data-edit-item="${index}" aria-label="Modifier cette pizza">
                <i data-lucide="pencil" aria-hidden="true"></i>
              </button>
              <button class="icon-button" type="button" data-remove-item="${index}" aria-label="Retirer cette pizza">
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
    const clientMessage = state.cart.length > 0
      ? `${PizzaMan.formatOrderMessage(order)}\n\nLien pizzeria: ${pizzeriaLink}`
      : "Ajoute une pizza pour générer le message de commande.";
    cartTotal.textContent = PizzaMan.formatMoney(total);
    messageOutput.value = clientMessage;

    const encodedMessage = encodeURIComponent(messageOutput.value);
    whatsappLink.href = state.cart.length > 0 ? `https://wa.me/?text=${encodedMessage}` : "#";
    smsLink.href = state.cart.length > 0 ? `sms:?&body=${encodedMessage}` : "#";
    mobileCartLabel.textContent =
      state.cart.length > 0 ? `${state.cart.length} article(s) - ${PizzaMan.formatMoney(total)}` : "Voir la commande";

    refreshIcons();
  }

  async function copyText(text, successMessage) {
    if (!state.cart.length) {
      setFeedback("Ajoute au moins une pizza avant d'envoyer la commande.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setFeedback(successMessage);
    } catch (error) {
      setFeedback("Copie impossible automatiquement. Sélectionne le texte et copie-le manuellement.");
    }
  }

  function copyMessage() {
    copyText(messageOutput.value, "Message copié.");
  }

  function copyPizzeriaLink() {
    const link = PizzaMan.buildPizzeriaLink(getCurrentOrder());
    copyText(link, "Lien pizzeria copié. Il permet d'ajouter cette commande côté pizzeria.");
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
