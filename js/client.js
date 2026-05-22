(function () {
  const state = {
    cart: [],
    selectedPizzaId: null,
    editingIndex: null,
    selectedSize: "small",
    selectedHamOption: "with",
    selectedExtras: new Set(),
    quantity: 1,
  };

  const menuGrid = document.querySelector("#menu-grid");
  const emptyCart = document.querySelector("#empty-cart");
  const cartItems = document.querySelector("#cart-items");
  const cartTotal = document.querySelector("#cart-total");
  const cartSubtotals = document.querySelector("#cart-subtotals");
  const cartCount = document.querySelector("#cart-count");
  const customerForm = document.querySelector("#customer-form");
  const modeSelect = customerForm.querySelector("select[name='mode']");
  const addressField = document.querySelector("#address-field");
  const desiredTimeSelect = document.querySelector("#desired-time");
  const messageOutput = document.querySelector("#message-output");
  const orderButton = document.querySelector("#order-button");
  const feedback = document.querySelector("#client-feedback");
  const deliveryMinimumWarning = document.querySelector("#delivery-minimum-warning");
  const bottomBarCart = document.querySelector("#bottom-bar-cart");
  const bottomBarOrder = document.querySelector("#bottom-bar-order");
  const bottomBarCount = document.querySelector("#bottom-bar-count");
  const bottomBarTotal = document.querySelector("#bottom-bar-total");
  const featuredDialog = document.querySelector("#featured-dialog");
  const featuredClose = document.querySelector("#featured-close");
  const featuredDismiss = document.querySelector("#featured-dismiss");
  const featuredAdd = document.querySelector("#featured-add");
  const featuredImage = document.querySelector("#featured-image");
  const featuredBadge = document.querySelector("#featured-badge");
  const featuredTitle = document.querySelector("#featured-title");
  const featuredName = document.querySelector("#featured-name");
  const featuredDescription = document.querySelector("#featured-description");
  const featuredNote = document.querySelector("#featured-note");
  const featuredPrice = document.querySelector("#featured-price");
  const dialog = document.querySelector("#pizza-dialog");
  const confirmDialog = document.querySelector("#confirm-dialog");
  const confirmCancel = document.querySelector("#confirm-cancel");
  const confirmSend = document.querySelector("#confirm-send");
  const pizzaForm = document.querySelector("#pizza-form");
  const dialogImage = document.querySelector("#dialog-image");
  const dialogTitle = document.querySelector("#dialog-title");
  const dialogDescription = document.querySelector("#dialog-description");
  const sizeField = document.querySelector(".segmented-field");
  const sizeControl = document.querySelector("#size-control");
  const hamField = document.querySelector("#ham-field");
  const hamControl = document.querySelector("#ham-control");
  const extrasGrid = document.querySelector("#extras-grid");
  const extrasField = document.querySelector("#extras-details");
  const extrasToggle = document.querySelector("#extras-toggle");
  const modificationInput = document.querySelector("#modification-input");
  const modificationLabel = modificationInput.closest("label");
  const quantityValue = document.querySelector("#quantity-value");
  const qtyMinus = document.querySelector("#qty-minus");
  const qtyPlus = document.querySelector("#qty-plus");
  const dialogPrice = document.querySelector("#dialog-price");
  const closeDialogButton = document.querySelector(".close-dialog");

  function init() {
    renderMenu();
    renderTimeSlots();
    updateCustomerRequirements();
    renderCart();
    bindEvents();
    renderFeaturedPizzaPopup();
    window.setInterval(() => {
      renderTimeSlots();
    }, 60000);
    refreshIcons();
  }

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function updateCustomerRequirements() {
    if (!modeSelect || !addressField) return;

    const deliverySelected = modeSelect.value === "Livraison";
    addressField.required = deliverySelected;
    addressField.placeholder = deliverySelected
      ? "Adresse complète, code porte, étage..."
      : "Précision facultative...";
  }

  function renderTimeSlots() {
    if (!desiredTimeSelect) return;

    const selectedTime = desiredTimeSelect.value;
    const now = new Date();
    const isOrderDay = PizzaMan.isOrderDay(now);
    const slots = isOrderDay
      ? PizzaMan.orderTimeSlots().filter((time) => !PizzaMan.isSlotInPast(time, now))
      : [];
    const selectedStillAvailable = selectedTime && slots.includes(selectedTime);

    desiredTimeSelect.disabled = !isOrderDay;
    desiredTimeSelect.innerHTML = [
      `<option value="">${isOrderDay ? "Choisir une heure" : "Fermé aujourd'hui"}</option>`,
      ...slots.map(
        (time) =>
          `<option value="${PizzaMan.escapeHtml(time)}" ${
            time === selectedTime && selectedStillAvailable ? "selected" : ""
          }>${PizzaMan.escapeHtml(PizzaMan.formatTimeLabel(time))}</option>`,
      ),
    ].join("");

    if (isOrderDay && selectedTime && !selectedStillAvailable) {
      setFeedback("L'heure choisie est passée. Choisis un nouveau créneau.");
    }
  }

  function renderMenu() {
    const featured = getFeaturedPizza();
    const categories = new Map();

    if (featured) {
      categories.set(featured.featured.category || "Pizza du moment", [featured.item]);
    }

    PizzaMan.menu.forEach((item) => {
      if (featured && item.id === featured.item.id) return;
      const category = item.category || "Carte";
      if (!categories.has(category)) categories.set(category, []);
      categories.get(category).push(item);
    });

    menuGrid.innerHTML = Array.from(categories.entries())
      .map(([category, items]) => {
        const cards = items.map(renderMenuCard).join("");
        const isFeaturedCategory = featured && category === (featured.featured.category || "Pizza du moment");
        return `
          <section class="menu-category${isFeaturedCategory ? " is-featured" : ""}">
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
    const description = PizzaMan.escapeHtml(PizzaMan.displayDescription(item));
    const price = PizzaMan.formatPriceRange(item);
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
          <div class="pizza-actions single-action">
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

  function renderHamOptionControl(item) {
    if (!hamField || !hamControl) return;
    hamField.hidden = !PizzaMan.allowsHamOption(item);
  }

  function getFeaturedPizza() {
    const featured = PizzaMan.featuredPizza || {};
    if (!featured.pizzaId) return null;
    const item = PizzaMan.getMenuItem(featured.pizzaId);
    return item ? { featured, item } : null;
  }

  function renderFeaturedPizzaPopup() {
    if (!featuredDialog) return;

    const current = getFeaturedPizza();
    if (!current) return;

    const { featured, item } = current;
    featuredImage.src = item.image;
    featuredImage.alt = `Pizza ${item.name}`;
    featuredBadge.textContent = featured.badge || "Pizza du moment";
    featuredTitle.textContent = featured.title || "Pizza du moment";
    featuredName.textContent = item.name;
    featuredDescription.textContent = PizzaMan.displayDescription(item);
    featuredNote.textContent = featured.note || "";
    featuredNote.hidden = !featured.note;
    featuredPrice.textContent = PizzaMan.formatPriceRange(item);

    featuredDialog.showModal();
    refreshIcons();
  }

  function updateExtrasToggleLabel() {
    if (!extrasToggle) return;
    const count = state.selectedExtras.size;
    extrasToggle.querySelector(".extras-toggle-count").textContent =
      count > 0 ? `${count} sélectionné${count > 1 ? "s" : ""}` : "Aucun";
  }

  function bindEvents() {
    menuGrid.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-add-pizza]");
      if (!button) return;
      openDialog(button.dataset.addPizza);
    });

    sizeControl.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-size]");
      if (!button) return;
      state.selectedSize = button.dataset.size;
      const item = PizzaMan.getMenuItem(state.selectedPizzaId);
      renderExtras(item);
      updateDialogState();
    });

    hamControl.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-ham-option]");
      if (!button) return;
      state.selectedHamOption = button.dataset.hamOption;
      updateDialogState();
    });

    extrasGrid.addEventListener("change", (event) => {
      const input = event.target.closest("input[type='checkbox']");
      const selectedInputs = Array.from(extrasGrid.querySelectorAll("input:checked"));
      const maxExtras = PizzaMan.business.maxExtrasPerPizza;

      if (input && input.checked && selectedInputs.length > maxExtras) {
        input.checked = false;
        setFeedback(`Maximum ${maxExtras} suppléments par pizza.`);
      }

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
      const plusButton = event.target.closest("button[data-cart-plus]");
      const minusButton = event.target.closest("button[data-cart-minus]");

      if (editButton) {
        openDialog(state.cart[Number(editButton.dataset.editItem)].pizzaId, Number(editButton.dataset.editItem));
      }

      if (removeButton) {
        state.cart.splice(Number(removeButton.dataset.removeItem), 1);
        renderCart();
      }

      if (plusButton) {
        const idx = Number(plusButton.dataset.cartPlus);
        state.cart[idx].quantity = (state.cart[idx].quantity || 1) + 1;
        renderCart();
      }

      if (minusButton) {
        const idx = Number(minusButton.dataset.cartMinus);
        state.cart[idx].quantity = (state.cart[idx].quantity || 1) - 1;
        if (state.cart[idx].quantity <= 0) {
          state.cart.splice(idx, 1);
        }
        renderCart();
      }
    });

    customerForm.addEventListener("input", () => {
      renderCart();
    });
    customerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      focusNextCustomerField(document.activeElement);
    });
    customerForm.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;

      const field = event.target.closest("input");
      if (!field || !customerForm.contains(field)) return;

      event.preventDefault();
      focusNextCustomerField(field);
    });
    customerForm.addEventListener("change", () => {
      updateCustomerRequirements();
      renderCart();
    });
    orderButton.addEventListener("click", orderWithSms);

    bottomBarCart.addEventListener("click", () => {
      document.querySelector("#commande").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    bottomBarOrder.addEventListener("click", orderWithSms);

    featuredClose.addEventListener("click", () => featuredDialog.close());
    featuredDismiss.addEventListener("click", () => featuredDialog.close());
    featuredAdd.addEventListener("click", () => {
      const current = getFeaturedPizza();
      if (!current) return;
      featuredDialog.close();
      openDialog(current.item.id);
    });
    featuredDialog.addEventListener("click", (event) => {
      if (event.target === featuredDialog) featuredDialog.close();
    });

    confirmCancel.addEventListener("click", () => confirmDialog.close());
    confirmSend.addEventListener("click", sendOrderSms);
    confirmDialog.addEventListener("click", (event) => {
      if (event.target === confirmDialog) confirmDialog.close();
    });
  }

  function focusNextCustomerField(currentField) {
    const fields = Array.from(customerForm.querySelectorAll("input, select, textarea")).filter(
      (field) => !field.disabled && !field.hidden,
    );
    const currentIndex = fields.indexOf(currentField);
    const nextField = fields[currentIndex + 1];

    if (nextField) {
      nextField.focus();
      return;
    }

    orderButton.focus();
  }

  function openDialog(pizzaId, editingIndex = null) {
    const item = PizzaMan.getMenuItem(pizzaId);
    if (!item) return;

    const existing = editingIndex !== null ? state.cart[editingIndex] : null;
    state.selectedPizzaId = pizzaId;
    state.editingIndex = editingIndex;
    state.selectedSize = existing ? existing.size : PizzaMan.getDefaultSize(item);
    state.selectedHamOption = existing
      ? existing.hamOption || PizzaMan.defaultHamOption(item)
      : PizzaMan.defaultHamOption(item);
    state.selectedExtras = new Set(existing ? existing.extras || [] : []);
    state.quantity = existing ? existing.quantity : 1;
    modificationInput.value = existing ? existing.modification || "" : "";

    dialogImage.src = item.image;
    dialogImage.alt = item.type === "drink" ? item.name : `Pizza ${item.name}`;
    dialogTitle.textContent = item.name;
    dialogDescription.textContent = PizzaMan.displayDescription(item);

    renderSizeControl(item);
    renderHamOptionControl(item);
    renderExtras(item);
    if (extrasField && extrasField.tagName === "DETAILS") {
      extrasField.open = state.selectedExtras.size > 0;
    }
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

    if (!PizzaMan.allowsHamOption(item)) {
      state.selectedHamOption = "";
    } else if (!state.selectedHamOption) {
      state.selectedHamOption = PizzaMan.defaultHamOption(item);
    }

    const maxExtras = PizzaMan.business.maxExtrasPerPizza;
    if (state.selectedExtras.size > maxExtras) {
      state.selectedExtras = new Set(Array.from(state.selectedExtras).slice(0, maxExtras));
      setFeedback(`Maximum ${maxExtras} suppléments par pizza.`);
    }

    if (!PizzaMan.allowsModification(item)) {
      modificationInput.value = "";
    }

    modificationLabel.hidden = !PizzaMan.allowsModification(item);

    Array.from(sizeControl.querySelectorAll("button[data-size]")).forEach((button) => {
      button.classList.toggle("active", button.dataset.size === state.selectedSize);
    });

    Array.from(hamControl.querySelectorAll("button[data-ham-option]")).forEach((button) => {
      button.classList.toggle("active", button.dataset.hamOption === state.selectedHamOption);
    });

    const extraLimitReached = state.selectedExtras.size >= maxExtras;
    Array.from(extrasGrid.querySelectorAll("input")).forEach((input) => {
      const checked = state.selectedExtras.has(input.value);
      input.checked = checked;
      input.disabled = !checked && extraLimitReached;
      input.closest(".extra-option").classList.toggle("is-disabled", input.disabled);
    });

    updateExtrasToggleLabel();

    quantityValue.textContent = state.quantity;
    const tempItem = {
      pizzaId: state.selectedPizzaId,
      size: state.selectedSize,
      hamOption: PizzaMan.allowsHamOption(item) ? state.selectedHamOption : "",
      extras: Array.from(state.selectedExtras),
      modification: modificationInput.value.trim(),
      quantity: state.quantity,
    };
    dialogPrice.textContent = PizzaMan.formatMoney(PizzaMan.itemTotal(tempItem));
  }

  function cartItemSignature(item) {
    return [
      item.pizzaId,
      item.size,
      item.hamOption || "",
      [...(item.extras || [])].sort().join(","),
      String(item.modification || "").trim(),
    ].join("|");
  }

  function saveDialogItem() {
    const itemData = PizzaMan.getMenuItem(state.selectedPizzaId);
    const item = {
      pizzaId: state.selectedPizzaId,
      size: state.selectedSize,
      hamOption: PizzaMan.allowsHamOption(itemData) ? state.selectedHamOption || PizzaMan.defaultHamOption(itemData) : "",
      extras: PizzaMan.allowsExtras(itemData)
        ? Array.from(state.selectedExtras).slice(0, PizzaMan.business.maxExtrasPerPizza)
        : [],
      modification: PizzaMan.allowsModification(itemData) ? modificationInput.value.trim() : "",
      quantity: state.quantity,
    };

    if (state.editingIndex !== null) {
      state.cart[state.editingIndex] = item;
    } else {
      const sig = cartItemSignature(item);
      const matchIdx = state.cart.findIndex((existing) => cartItemSignature(existing) === sig);
      if (matchIdx >= 0) {
        state.cart[matchIdx].quantity += item.quantity;
      } else {
        state.cart.push(item);
      }
    }

    dialog.close();
    renderCart();
  }

  function getCustomer() {
    const formData = new FormData(customerForm);
    return {
      name: String(formData.get("name") || "").trim(),
      mode: String(formData.get("mode") || "À emporter"),
      desiredTime: String(formData.get("desiredTime") || "").trim(),
      address: String(formData.get("address") || "").trim(),
    };
  }

  function getCurrentOrder() {
    return PizzaMan.createOrder(state.cart, getCustomer());
  }

  function renderCart() {
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
        const hamOption = PizzaMan.escapeHtml(
          menuItem && PizzaMan.allowsHamOption(menuItem)
            ? PizzaMan.hamOptionLabel(item.hamOption || PizzaMan.defaultHamOption(menuItem))
            : "",
        );
        const extrasLabel = PizzaMan.escapeHtml(extras);
        const modification = PizzaMan.escapeHtml(item.modification || "");
        const titleLine = size ? `${itemName} · ${size}` : `${itemName}`;
        return `
          <article class="cart-item">
            <div class="cart-item-header">
              <h3>${titleLine}</h3>
              <strong>${PizzaMan.formatMoney(PizzaMan.itemTotal(item))}</strong>
            </div>
            ${hamOption ? `<p><strong>Jambon: ${hamOption}</strong></p>` : ""}
            ${extrasLabel ? `<p><strong>Suppléments: ${extrasLabel}</strong></p>` : ""}
            ${modification ? `<p><strong>Modification: ${modification}</strong></p>` : ""}
            <div class="cart-item-controls">
              <div class="cart-stepper" aria-label="Quantité">
                <button type="button" data-cart-minus="${index}" aria-label="Retirer une pizza">
                  <i data-lucide="minus" aria-hidden="true"></i>
                </button>
                <strong>${item.quantity}</strong>
                <button type="button" data-cart-plus="${index}" aria-label="Ajouter une pizza">
                  <i data-lucide="plus" aria-hidden="true"></i>
                </button>
              </div>
              <div class="cart-item-icons">
                <button class="icon-button" type="button" data-edit-item="${index}" aria-label="Modifier cet article">
                  <i data-lucide="pencil" aria-hidden="true"></i>
                </button>
                <button class="icon-button" type="button" data-remove-item="${index}" aria-label="Retirer cet article">
                  <i data-lucide="trash-2" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    const order = getCurrentOrder();
    const total = PizzaMan.orderTotal(order);
    const subtotals = PizzaMan.categorySubtotals(order);
    const delivery = PizzaMan.deliveryCharge(order);
    const deliveryWarning = PizzaMan.deliveryMinimumWarning(order);

    const subtotalLines = [];
    if (subtotals.pizzas > 0 || delivery > 0) {
      const label = delivery > 0 ? "Pizzas + livraison" : "Pizzas";
      subtotalLines.push({ label, amount: subtotals.pizzas + delivery });
    }
    if (subtotals.drinks > 0) {
      subtotalLines.push({ label: "Boissons", amount: subtotals.drinks });
    }
    if (subtotals.wines > 0) {
      subtotalLines.push({ label: "Vins", amount: subtotals.wines });
    }
    cartSubtotals.innerHTML = subtotalLines
      .map(
        (line) =>
          `<div class="cart-subtotal-row"><span>${PizzaMan.escapeHtml(line.label)}</span><strong>${PizzaMan.formatMoney(line.amount)}</strong></div>`,
      )
      .join("");
    cartSubtotals.hidden = subtotalLines.length <= 1;
    const clientMessage =
      state.cart.length > 0
        ? PizzaMan.formatOrderMessage(order)
        : "Ajoute un article pour générer le message de commande.";
    cartTotal.textContent = PizzaMan.formatMoney(total);
    messageOutput.value = clientMessage;
    deliveryMinimumWarning.textContent = deliveryWarning;
    deliveryMinimumWarning.hidden = !deliveryWarning;

    const articleCount = PizzaMan.articleCount(order);
    cartCount.textContent = `${articleCount} article${articleCount > 1 ? "s" : ""}`;

    bottomBarCount.textContent = articleCount;
    bottomBarCount.classList.toggle("is-empty", articleCount === 0);
    bottomBarTotal.textContent = PizzaMan.formatMoney(total);
    bottomBarOrder.disabled = articleCount === 0;

    refreshIcons();
  }

  function buildSmsHref(message) {
    const userAgent = navigator.userAgent || "";
    const isAppleMobile =
      /iPad|iPhone|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
    const separator = isAppleMobile ? "&" : "?";
    return `${PizzaMan.business.smsHref}${separator}body=${encodeURIComponent(message)}`;
  }

  function orderWithSms() {
    if (!state.cart.length) {
      setFeedback("Ajoute au moins un article avant d'envoyer la commande.");
      return;
    }

    if (!PizzaMan.isOrderDay()) {
      setFeedback("La pizzeria est fermée aujourd'hui. Commandes du mardi au samedi.");
      renderTimeSlots();
      return;
    }

    updateCustomerRequirements();
    if (!customerForm.reportValidity()) {
      setFeedback("Renseigne les champs obligatoires avant d'envoyer la commande.");
      return;
    }

    const order = getCurrentOrder();
    if (!order.customer.desiredTime) {
      setFeedback("Choisis une heure pour la commande.");
      return;
    }

    if (!PizzaMan.isValidOrderSlot(order.customer.desiredTime)) {
      setFeedback("Choisis une heure entre 18h45 et 21h30, par tranche de 15 minutes.");
      return;
    }

    if (PizzaMan.isSlotInPast(order.customer.desiredTime)) {
      setFeedback("L'heure choisie est déjà passée. Choisis un nouveau créneau.");
      renderTimeSlots();
      return;
    }

    const deliveryWarning = PizzaMan.deliveryMinimumWarning(order);
    if (deliveryWarning) {
      setFeedback(deliveryWarning);
      return;
    }

    confirmDialog.showModal();
    refreshIcons();
  }

  function sendOrderSms() {
    confirmDialog.close();
    window.location.href = buildSmsHref(messageOutput.value);
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
