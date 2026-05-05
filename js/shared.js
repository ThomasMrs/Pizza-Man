(function () {
  const menu = [
    {
      id: "margherita",
      name: "Margherita",
      description: "Tomate, mozzarella, basilic frais, huile d'olive.",
      prices: { small: 8.5, large: 11.5 },
      image:
        "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "reine",
      name: "Reine",
      description: "Tomate, mozzarella, jambon, champignons frais.",
      prices: { small: 9.5, large: 12.9 },
      image:
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "quatre-fromages",
      name: "4 Fromages",
      description: "Tomate, mozzarella, chèvre, gorgonzola, parmesan.",
      prices: { small: 10.5, large: 14.5 },
      image:
        "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "pepperoni",
      name: "Pepperoni",
      description: "Tomate, mozzarella, pepperoni, origan.",
      prices: { small: 10, large: 13.9 },
      image:
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "vegetarienne",
      name: "Végétarienne",
      description: "Tomate, mozzarella, poivrons, champignons, olives, oignons.",
      prices: { small: 9.9, large: 13.5 },
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "pizza-man",
      name: "Pizza'Man",
      description: "Crème, mozzarella, poulet, pommes de terre, oignons rouges.",
      prices: { small: 11.5, large: 15.5 },
      image:
        "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const extras = [
    { id: "mozzarella", name: "Mozzarella", price: 1.5 },
    { id: "chevre", name: "Chèvre", price: 1.5 },
    { id: "jambon", name: "Jambon", price: 1.8 },
    { id: "pepperoni", name: "Pepperoni", price: 1.8 },
    { id: "champignons", name: "Champignons", price: 1.2 },
    { id: "oeuf", name: "Oeuf", price: 1.2 },
    { id: "olives", name: "Olives", price: 1 },
    { id: "roquette", name: "Roquette", price: 1 },
  ];

  const config = {
    adminUsername: "pizzeria",
    adminPassword: "pizza2026",
    currency: "EUR",
    orderStorageKey: "pizzaman-orders",
    sessionKey: "pizzaman-admin-session",
  };

  function createOrderId(date = new Date()) {
    const compactDate = date
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);
    return `PM-${compactDate}`;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: config.currency,
    }).format(value || 0);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return entities[char];
    });
  }

  function getPizza(id) {
    return menu.find((pizza) => pizza.id === id);
  }

  function getExtra(id) {
    return extras.find((extra) => extra.id === id);
  }

  function itemUnitPrice(item) {
    const pizza = getPizza(item.pizzaId);
    if (!pizza) return 0;
    const base = pizza.prices[item.size] || pizza.prices.small;
    const extrasTotal = (item.extras || []).reduce((total, extraId) => {
      const extra = getExtra(extraId);
      return total + (extra ? extra.price : 0);
    }, 0);
    return base + extrasTotal;
  }

  function itemTotal(item) {
    return itemUnitPrice(item) * (item.quantity || 1);
  }

  function orderTotal(order) {
    return (order.items || []).reduce((total, item) => total + itemTotal(item), 0);
  }

  function sizeLabel(size) {
    return size === "large" ? "Grande" : "Petite";
  }

  function itemSummary(item) {
    const pizza = getPizza(item.pizzaId);
    if (!pizza) return "Pizza inconnue";

    const extraLabels = (item.extras || [])
      .map((id) => getExtra(id))
      .filter(Boolean)
      .map((extra) => extra.name);

    const parts = [
      `${item.quantity || 1}x ${pizza.name}`,
      sizeLabel(item.size),
      extraLabels.length ? `Suppléments: ${extraLabels.join(", ")}` : "",
      item.modification ? `Modification: ${item.modification}` : "",
    ].filter(Boolean);

    return parts.join(" - ");
  }

  function createOrder(cart, customer, metadata = {}) {
    const now = metadata.createdAt ? new Date(metadata.createdAt) : new Date();

    return {
      id: metadata.id || createOrderId(now),
      createdAt: metadata.createdAt || now.toISOString(),
      status: "À faire",
      customer: {
        name: customer.name || "",
        phone: customer.phone || "",
        mode: customer.mode || "À emporter",
        address: customer.address || "",
      },
      items: cart.map((item) => ({ ...item })),
    };
  }

  function formatOrderMessage(order) {
    const customer = order.customer || {};
    const lines = [
      `Commande Pizza'Man ${order.id}`,
      "",
      `Client: ${customer.name || "Non renseigné"}`,
      `Téléphone: ${customer.phone || "Non renseigné"}`,
      `Mode: ${customer.mode || "À emporter"}`,
      customer.address ? `Précision: ${customer.address}` : "",
      "",
      "Pizzas:",
      ...(order.items || []).map((item) => `- ${itemSummary(item)} (${formatMoney(itemTotal(item))})`),
      "",
      `Total: ${formatMoney(orderTotal(order))}`,
    ];

    return lines.filter((line, index) => line !== "" || lines[index - 1] !== "").join("\n");
  }

  function encodeOrder(order) {
    const json = JSON.stringify(order);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodeOrder(value) {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  }

  function buildPizzeriaLink(order) {
    const url = new URL("pizzeria.html", window.location.href);
    url.searchParams.set("order", encodeOrder(order));
    return url.toString();
  }

  function loadOrders() {
    try {
      return JSON.parse(localStorage.getItem(config.orderStorageKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem(config.orderStorageKey, JSON.stringify(orders));
  }

  window.PizzaMan = {
    menu,
    extras,
    config,
    createOrderId,
    escapeHtml,
    formatMoney,
    getPizza,
    getExtra,
    itemUnitPrice,
    itemTotal,
    orderTotal,
    sizeLabel,
    itemSummary,
    createOrder,
    formatOrderMessage,
    encodeOrder,
    decodeOrder,
    buildPizzeriaLink,
    loadOrders,
    saveOrders,
  };
})();
