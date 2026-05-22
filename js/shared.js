(function () {
  const business = {
    name: "Pizza'Man St Jean",
    shortName: "Pizza'Man",
    headline: "Pizza'Man St Jean - Cuisson au feu de bois - Depuis 1996",
    address: "8 Route Nationale 115, 66490 Saint-Jean-Pla-de-Corts",
    hours: "Ouvert du mardi au samedi de 18h45 à 21h30",
    phone: "06-46-57-63-69",
    smsHref: "sms:+33646576369",
    whatsappHref: "https://wa.me/33646576369",
    facebookUrl: "https://www.facebook.com/pizzaman.stjean/?ref=page_internal",
    googleUrl: "https://share.google/MiNwfMVDMd9wwK8vd",
    deliveryZones: "Le Boulou, Céret, Maureillas, St Jean",
    deliveryFee: 4,
    deliveryMinimum: 2,
    maxExtrasPerPizza: Infinity,
    orderDays: [2, 3, 4, 5, 6],
    orderStartTime: "18:00",
    orderEndTime: "21:00",
    orderSlotMinutes: 15,
    deliveryNote: "Livraison à partir de 2 pizzas, pas de pizza offerte en livraison.",
    allergenNote: "Liste des allergènes disponible sur demande.",
  };

  const config = {
    currency: "EUR",
    modificationPrice: 0.5,
    supplementPrices: {
      small: 1,
      large: 1.5,
      single: 1,
    },
  };

  const images = {
    classic:
      "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=900&q=80",
    cheese:
      "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80",
    fish:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
    meat:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80",
    sweet:
      "https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=900&q=80",
    special:
      "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=900&q=80",
    dessert:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    drinks:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
  };

  
  const menu = [
    {
      id: "margarita",
      name: "Margarita",
      category: "Les classiques",
      description: "Tomate, jambon, emmental, mozzarella, olives. Disponible avec ou sans jambon.",
      prices: { small: 11.9, large: 13.9 },
      image: images.classic,
      type: "pizza",
      hamOption: true,
    },
    {
      id: "regina",
      name: "Régina",
      category: "Les classiques",
      description: "Tomate, jambon, champignons, emmental, olives.",
      prices: { small: 12.9, large: 14.9 },
      image: images.classic,
      type: "pizza",
    },
    {
      id: "complete",
      name: "Complète",
      category: "Les classiques",
      description: "Tomate, jambon, emmental, oeuf, olives.",
      prices: { small: 11.9, large: 13.9 },
      image: images.classic,
      type: "pizza",
    },
    {
      id: "royale",
      name: "Royale",
      category: "Les classiques",
      description: "Crème, champignons, emmental, lardons, chèvre, oeuf, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.classic,
      type: "pizza",
    },
    {
      id: "roquefort",
      name: "Roquefort",
      category: "Le choix du fromager",
      description: "Tomate, emmental, roquefort, mozzarella, crème, olives.",
      prices: { small: 13.9, large: 15.9 },
      image: images.cheese,
      type: "pizza",
    },
    {
      id: "4-fromages",
      name: "4 Fromages",
      category: "Le choix du fromager",
      description: "Tomate, emmental, mozzarella, chèvre, roquefort, crème, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.cheese,
      type: "pizza",
    },
    {
      id: "reblochonne",
      name: "Reblochonne",
      category: "Le choix du fromager",
      description: "Crème, emmental, reblochon, lardons, oignons, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.cheese,
      type: "pizza",
    },
    {
      id: "raclette",
      name: "Raclette",
      category: "Le choix du fromager",
      description: "Crème, jambon, emmental, raclette, lardons, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.cheese,
      type: "pizza",
    },
    {
      id: "sicilienne",
      name: "Sicilienne",
      category: "Le choix du pêcheur",
      description: "Tomate, emmental, anchois, olives.",
      prices: { small: 12.9, large: 14.9 },
      image: images.fish,
      type: "pizza",
    },
    {
      id: "catalane",
      name: "Catalane",
      category: "Le choix du pêcheur",
      description: "Tomate, emmental, anchois, poivrons, oignons, olives.",
      prices: { small: 13.9, large: 15.9 },
      image: images.fish,
      type: "pizza",
    },
    {
      id: "norvegienne",
      name: "Norvégienne",
      category: "Le choix du pêcheur",
      description: "Tomate, saumon, emmental, mozzarella, crème, olives.",
      prices: { small: 13.9, large: 17.9 },
      image: images.fish,
      type: "pizza",
    },
    {
      id: "chorizo",
      name: "Chorizo",
      category: "Le choix du charcutier",
      description: "Tomate, chorizo, emmental, crème fraîche, olives.",
      prices: { small: 12.9, large: 14.9 },
      image: images.meat,
      type: "pizza",
    },
    {
      id: "super-chorizo",
      name: "Super Chorizo",
      category: "Le choix du charcutier",
      description: "Tomate, chorizo, emmental, chèvre, poivrons, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.meat,
      type: "pizza",
    },
    {
      id: "super-chef",
      name: "Super Chef",
      category: "Le choix du charcutier",
      description: "Tomate, emmental, merguez, oignons, olives.",
      prices: { small: 13.9, large: 15.9 },
      image: images.meat,
      type: "pizza",
    },
    {
      id: "royal-merguez",
      name: "Royal Merguez",
      category: "Le choix du charcutier",
      description: "Tomate, chorizo, emmental, merguez, oeuf, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.meat,
      type: "pizza",
    },
    {
      id: "campagnarde",
      name: "Campagnarde",
      category: "Le choix du charcutier",
      description: "Tomate, emmental, lardons, oignons, crème, olives.",
      prices: { small: 13.9, large: 15.9 },
      image: images.meat,
      type: "pizza",
    },
    {
      id: "forestiere",
      name: "Forestière",
      category: "Le choix du charcutier",
      description: "Tomate, champignons, emmental, lardons, crème, ail, olives.",
      prices: { small: 13.9, large: 15.9 },
      image: images.meat,
      type: "pizza",
    },
    {
      id: "popolino",
      name: "Popoliño",
      category: "Les sucrées / salées",
      description: "Tomate, jambon, ananas, emmental, chèvre, miel, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.sweet,
      type: "pizza",
    },
    {
      id: "hawaienne",
      name: "Hawaïenne",
      category: "Les sucrées / salées",
      description: "Tomate, jambon, ananas, emmental, olives.",
      prices: { small: 12.9, large: 14.9 },
      image: images.sweet,
      type: "pizza",
    },
    {
      id: "chevre-miel",
      name: "Chèvre Miel",
      category: "Les sucrées / salées",
      description: "Crème fraîche, emmental, mozzarella, miel, chèvre, olives.",
      prices: { small: 12.9, large: 14.9 },
      image: images.sweet,
      type: "pizza",
    },
    {
      id: "reblo-miel",
      name: "Reblo-Miel",
      category: "Les sucrées / salées",
      description: "Crème, emmental, reblochon, miel, lardons, oignons, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.sweet,
      type: "pizza",
    },
    {
      id: "vegetarienne",
      name: "Végétarienne",
      category: "Les spéciales",
      description: "Tomate, champignons, emmental, poivrons, oignons, pincée de sel, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.special,
      type: "pizza",
    },
    {
      id: "bbq",
      name: "BBQ",
      category: "Les spéciales",
      description: "Tomate, emmental, sauce BBQ, viande hachée, poivrons, oignons, olives.",
      prices: { small: 13.9, large: 16.9 },
      image: images.special,
      type: "pizza",
    },
    {
      id: "kebab",
      name: "Kebab",
      category: "Les spéciales",
      description: "Base tomate, emmental, kebab hallal, oignons, crème fraîche, olives.",
      prices: { small: 13.9, large: 17.9 },
      image: images.special,
      type: "pizza",
    },
    {
      id: "super-magret",
      name: "Super Magret",
      category: "Les spéciales",
      description: "Crème, champignons, emmental, magret du sud-ouest, sel, poivre, chèvre, olives.",
      prices: { small: 14.9, large: 18.9 },
      image: images.special,
      type: "pizza",
    },
    {
      id: "choco-banane",
      name: "Choco-Banane",
      category: "La pizza dessert",
      description: "Banane, Nutella, crème fraîche.",
      prices: { small: 10.9 },
      image: images.dessert,
      type: "pizza",
      allowExtras: false,
    },
    {
      id: "vin-deprade-jorda",
      name: "Vin Deprade Jorda",
      category: "Les boissons",
      description: "Rouge, rosé ou blanc.",
      prices: { single: 9.9 },
      image: images.drinks,
      type: "drink",
      allowExtras: false,
      allowModification: false,
    },
    {
      id: "lambrusco",
      name: "La bouteille de Lambrusco",
      category: "Les boissons",
      description: "Bouteille.",
      prices: { single: 9.9 },
      image: images.drinks,
      type: "drink",
      allowExtras: false,
      allowModification: false,
    },
    {
      id: "coca-125",
      name: "Coca-Cola 1,25 l",
      category: "Les boissons",
      description: "Grande bouteille.",
      prices: { single: 3.5 },
      image: images.drinks,
      type: "drink",
      allowExtras: false,
      allowModification: false,
    },
    {
      id: "canettes",
      name: "Canettes",
      category: "Les boissons",
      description: "Coca-Cola, bière, Ice Tea, etc.",
      prices: { single: 2.5 },
      image: images.drinks,
      type: "drink",
      allowExtras: false,
      allowModification: false,
    },
    {
      id: "despe-33",
      name: "Despé 33 cl",
      category: "Les boissons",
      description: "Bouteille 33 cl.",
      prices: { single: 3.5 },
      image: images.drinks,
      type: "drink",
      allowExtras: false,
      allowModification: false,
    },
    {
      id: "munster",
      name: "Munster",
      category: "Les spéciales",
      description: "base yaourt Grec, munster, lardons++, oignons++.",
      prices: { small: 13.9, large: 16.9 },
      image: images.classic,
      type: "pizza",
    },
  ];
  
  const menuImages = {
    margarita: "assets/photos/margarita.png",
    regina: "assets/photos/entravaux.jpg",
    complete: "assets/photos/supercomplete.png",
    royale: "assets/photos/entravaux.jpg",
    roquefort: "assets/photos/roquefort.png",
    "4-fromages": "assets/photos/entravaux.jpg",
    reblochonne: "assets/photos/reblochonne.png",
    raclette: "assets/photos/raclette.png",
    sicilienne: "assets/photos/entravaux.jpg",
    catalane: "assets/photos/catalane.png",
    norvegienne: "assets/photos/norvegienne.png",
    chorizo: "assets/photos/chorizo.png",
    "super-chorizo": "assets/photos/superchorizo.png",
    "super-chef": "assets/photos/entravaux.jpg",
    "royal-merguez": "assets/photos/royalmerguez.png",
    campagnarde: "assets/photos/entravaux.jpg",
    forestiere: "assets/photos/forestière.png",
    popolino: "assets/photos/popolino.png",
    hawaienne: "assets/photos/entravaux.jpg",
    "chevre-miel": "assets/photos/miel.png",
    "reblo-miel": "assets/photos/reblochonne.png",
    vegetarienne: "assets/photos/entravaux.jpg",
    bbq: "assets/photos/entravaux.jpg",
    kebab: "assets/photos/kebab.png",
    "super-magret": "assets/photos/supermagret.png",
    "choco-banane": "assets/photos/entravaux.jpg",
    "vin-deprade-jorda": "assets/photos/entravaux.jpg",
    lambrusco: "assets/photos/lambrusco.png",
    "coca-125": "assets/photos/coca-125.jpg",
    canettes: "assets/photos/canettes.jpg",
    "despe-33": "assets/photos/despe.jpg",
    munster: "assets/photos/munster.png",
  };

  menu.forEach((item) => {
    if (menuImages[item.id]) {
      item.image = menuImages[item.id];
    }
  });

  const featuredPizza = {
    // Pour désactiver la popup, commente seulement la ligne pizzaId ci-dessous.
    pizzaId: "munster",
    category: "Pizza du moment",
    badge: "Pizza du moment",
    title: "La pizza du moment",
    note: "Une pizza mise en avant pour le moment.",
    disableHamOption: true,
  };

  const extras = [
    { id: "emmental", name: "Emmental" },
    { id: "mozzarella", name: "Mozzarella" },
    { id: "chevre", name: "Chèvre" },
    { id: "roquefort", name: "Roquefort" },
    { id: "reblochon", name: "Reblochon" },
    { id: "raclette", name: "Raclette" },
    { id: "jambon", name: "Jambon" },
    { id: "lardons", name: "Lardons" },
    { id: "chorizo", name: "Chorizo" },
    { id: "merguez", name: "Merguez" },
    { id: "kebab", name: "Kebab" },
    { id: "viande-hachee", name: "Viande hachée" },
    { id: "saumon", name: "Saumon" },
    { id: "anchois", name: "Anchois" },
    { id: "champignons", name: "Champignons" },
    { id: "poivrons", name: "Poivrons" },
    { id: "oignons", name: "Oignons" },
    { id: "olives", name: "Olives" },
    { id: "oeuf", name: "Oeuf" },
    { id: "ananas", name: "Ananas" },
    { id: "miel", name: "Miel" },
    { id: "creme-fraiche", name: "Crème fraîche" },
    { id: "sauce-bbq", name: "Sauce BBQ" },
  ];

  const sizeLabels = {
    small: "Petite 26cm",
    large: "Grande 33cm",
    single: "",
  };

  function padTimePart(value) {
    return String(value).padStart(2, "0");
  }

  function timeToMinutes(time) {
    const [hours, minutes] = String(time || "").split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }

  function minutesToTime(minutes) {
    return `${padTimePart(Math.floor(minutes / 60))}:${padTimePart(minutes % 60)}`;
  }

  function isOrderDay(date = new Date()) {
    return business.orderDays.includes(date.getDay());
  }

  function isValidOrderSlot(time) {
    const value = timeToMinutes(time);
    const start = timeToMinutes(business.orderStartTime);
    const end = timeToMinutes(business.orderEndTime);
    if (value === null || start === null || end === null) return false;
    return value >= start && value <= end && value % business.orderSlotMinutes === 0;
  }

  function orderTimeSlots() {
    const start = timeToMinutes(business.orderStartTime);
    const end = timeToMinutes(business.orderEndTime);
    if (start === null || end === null) return [];

    const slots = [];
    for (let minutes = start; minutes <= end; minutes += business.orderSlotMinutes) {
      slots.push(minutesToTime(minutes));
    }
    return slots;
  }

  function isSlotInPast(time, now = new Date()) {
    const value = timeToMinutes(time);
    const end = timeToMinutes(business.orderEndTime);
    if (value === null || end === null) return true;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (currentMinutes > end) return false;
    return value <= currentMinutes;
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

  function getMenuItem(id) {
    return menu.find((item) => item.id === id);
  }

  function getExtra(id) {
    return extras.find((extra) => extra.id === id);
  }

  function getAvailableSizes(itemOrId) {
    const item = typeof itemOrId === "string" ? getMenuItem(itemOrId) : itemOrId;
    if (!item) return [];
    const order = ["small", "large", "single"];
    return order.filter((size) => Object.prototype.hasOwnProperty.call(item.prices, size));
  }

  function getDefaultSize(itemOrId) {
    return getAvailableSizes(itemOrId)[0] || "single";
  }

  function sizeLabel(size, itemOrId) {
    const item = typeof itemOrId === "string" ? getMenuItem(itemOrId) : itemOrId;
    if (size === "single") return item && item.singleLabel ? item.singleLabel : "";
    return sizeLabels[size] || size || "";
  }

  function allowsExtras(itemOrId) {
    const item = typeof itemOrId === "string" ? getMenuItem(itemOrId) : itemOrId;
    return Boolean(item && item.type === "pizza" && item.allowExtras !== false);
  }

  function allowsModification(itemOrId) {
    const item = typeof itemOrId === "string" ? getMenuItem(itemOrId) : itemOrId;
    return Boolean(item && item.type === "pizza" && item.allowModification !== false);
  }

  function allowsHamOption(itemOrId) {
    const item = typeof itemOrId === "string" ? getMenuItem(itemOrId) : itemOrId;
    return Boolean(item && item.hamOption);
  }

  function defaultHamOption(itemOrId) {
    return allowsHamOption(itemOrId) ? "with" : "";
  }

  function hamOptionLabel(value) {
    if (value === "without") return "Sans jambon";
    if (value === "with") return "Avec jambon";
    return "";
  }

  function displayDescription(itemOrId, options = {}) {
    const item = typeof itemOrId === "string" ? getMenuItem(itemOrId) : itemOrId;
    if (!item) return "";
    if (options.featured && item.id === featuredPizza.pizzaId && featuredPizza.disableHamOption) {
      return String(item.description || "")
        .replace(" Disponible avec ou sans jambon.", "")
        .replace("Disponible avec ou sans jambon.", "")
        .trim();
    }
    return item.description || "";
  }

  function supplementPrice(size) {
    return config.supplementPrices[size] || config.supplementPrices.small;
  }

  function formatPriceRange(itemOrId) {
    const item = typeof itemOrId === "string" ? getMenuItem(itemOrId) : itemOrId;
    if (!item) return "";
    const sizes = getAvailableSizes(item);
    if (sizes.length === 1) return formatMoney(item.prices[sizes[0]]);
    return sizes.map((size) => formatMoney(item.prices[size])).join(" / ");
  }

  function itemUnitPrice(item) {
    const menuItem = getMenuItem(item.pizzaId);
    if (!menuItem) return 0;
    const size = item.size && menuItem.prices[item.size] !== undefined ? item.size : getDefaultSize(menuItem);
    const base = menuItem.prices[size] || 0;
    const extrasTotal = allowsExtras(menuItem)
      ? (item.extras || []).reduce((total, extraId) => total + (getExtra(extraId) ? supplementPrice(size) : 0), 0)
      : 0;
    const modificationTotal =
      allowsModification(menuItem) && String(item.modification || "").trim() ? config.modificationPrice : 0;
    return base + extrasTotal + modificationTotal;
  }

  function itemTotal(item) {
    return itemUnitPrice(item) * (item.quantity || 1);
  }

  function itemsSubtotal(order) {
    return (order.items || []).reduce((total, item) => total + itemTotal(item), 0);
  }

  function isWineDrink(menuItem) {
    if (!menuItem || menuItem.type !== "drink") return false;
    const id = menuItem.id || "";
    return id.includes("vin") || id.includes("lambrusco");
  }

  function categorySubtotals(order) {
    let pizzas = 0;
    let wines = 0;
    let drinks = 0;
    (order.items || []).forEach((item) => {
      const menuItem = getMenuItem(item.pizzaId);
      const total = itemTotal(item);
      if (!menuItem) return;
      if (menuItem.type === "pizza") pizzas += total;
      else if (isWineDrink(menuItem)) wines += total;
      else drinks += total;
    });
    return { pizzas, wines, drinks };
  }

  function pizzaCount(order) {
    return (order.items || []).reduce((count, item) => {
      const menuItem = getMenuItem(item.pizzaId);
      return count + (menuItem && menuItem.type === "pizza" ? item.quantity || 1 : 0);
    }, 0);
  }

  function articleCount(order) {
    return (order.items || []).reduce((count, item) => count + (item.quantity || 1), 0);
  }

  function formatTimeLabel(time) {
    if (!time) return "Heure non définie";
    const parts = String(time).split(":");
    if (parts.length < 2) return time;
    return `${parts[0]}h${parts[1]}`;
  }

  function deliveryCharge(order) {
    return order.customer && order.customer.mode === "Livraison" && pizzaCount(order) >= business.deliveryMinimum
      ? business.deliveryFee
      : 0;
  }

  function deliveryMinimumWarning(order) {
    const customer = order.customer || {};
    return customer.mode === "Livraison" && (order.items || []).length > 0 && pizzaCount(order) < business.deliveryMinimum
      ? `Livraison possible à partir de ${business.deliveryMinimum} pizzas.`
      : "";
  }

  function orderTotal(order) {
    return itemsSubtotal(order) + deliveryCharge(order);
  }

  function itemSummary(item) {
    const menuItem = getMenuItem(item.pizzaId);
    if (!menuItem) return "Article inconnu";

    const label = sizeLabel(item.size, menuItem);
    const extraLabels = allowsExtras(menuItem)
      ? (item.extras || [])
          .map((id) => getExtra(id))
          .filter(Boolean)
          .map((extra) => extra.name)
      : [];

    const parts = [
      `${item.quantity || 1}x ${menuItem.name}`,
      label,
      allowsHamOption(menuItem) && !item.disableHamOption
        ? hamOptionLabel(item.hamOption || defaultHamOption(menuItem))
        : "",
      extraLabels.length ? `Suppléments: ${extraLabels.join(", ")}` : "",
      allowsModification(menuItem) && item.modification ? `Modification: ${item.modification}` : "",
    ].filter(Boolean);

    return parts.join(" - ");
  }

  function createOrder(cart, customer) {
    return {
      status: "À faire",
      customer: {
        name: customer.name || "",
        mode: customer.mode || "À emporter",
        address: customer.address || "",
        desiredTime: customer.desiredTime || "",
      },
      items: cart.map((item) => ({
        ...item,
        hamOption:
          allowsHamOption(item.pizzaId) && !item.disableHamOption
            ? item.hamOption || defaultHamOption(item.pizzaId)
            : "",
        extras: Array.isArray(item.extras) ? item.extras.slice(0, business.maxExtrasPerPizza) : [],
      })),
    };
  }

  function formatOrderItemLines(item) {
    const menuItem = getMenuItem(item.pizzaId);
    if (!menuItem) return ["- Article inconnu"];

    const size = sizeLabel(item.size, menuItem);
    const total = formatMoney(itemTotal(item));
    const header = `- ${item.quantity || 1}x ${menuItem.name}${size ? ` - ${size}` : ""} (${total})`;
    const lines = [header];

    const extraLabels = allowsExtras(menuItem)
      ? (item.extras || [])
          .map((id) => getExtra(id))
          .filter(Boolean)
          .map((extra) => extra.name)
      : [];

    if (extraLabels.length) {
      lines.push(`  ⚠️ Suppléments: ${extraLabels.join(", ")}`);
    }

    if (allowsHamOption(menuItem) && !item.disableHamOption) {
      lines.push(`  Jambon: ${hamOptionLabel(item.hamOption || defaultHamOption(menuItem))}`);
    }

    if (allowsModification(menuItem) && item.modification) {
      lines.push(`  ⚠️ Modification: ${item.modification}`);
    }

    return lines;
  }

  function formatOrderMessage(order) {
    const customer = order.customer || {};
    const delivery = deliveryCharge(order);
    const deliveryWarning = deliveryMinimumWarning(order);
    const itemLines = (order.items || []).flatMap(formatOrderItemLines);
    const subtotals = categorySubtotals(order);
    const lines = [
      `Commande Pizza'Man`,
      "",
      `Client: ${customer.name || "Non renseigné"}`,
      `Mode: ${customer.mode || "À emporter"}`,
      customer.desiredTime ? `Heure: ${formatTimeLabel(customer.desiredTime)}` : "",
      customer.address ? `Adresse: ${customer.address}` : "",
      deliveryWarning ? `⚠️ ${deliveryWarning}` : "",
      "",
      "Articles:",
      ...itemLines,
      delivery ? `Frais livraison: ${formatMoney(delivery)}` : "",
      "",
      subtotals.pizzas > 0 || delivery > 0
        ? `Total pizzas${delivery > 0 ? " + livraison" : ""}: ${formatMoney(subtotals.pizzas + delivery)}`
        : "",
      subtotals.drinks > 0 ? `Total boissons: ${formatMoney(subtotals.drinks)}` : "",
      subtotals.wines > 0 ? `Total vins: ${formatMoney(subtotals.wines)}` : "",
      `Total: ${formatMoney(orderTotal(order))}`,
    ];

    return lines.filter((line, index) => line !== "" || lines[index - 1] !== "").join("\n");
  }

  window.PizzaMan = {
    business,
    menu,
    featuredPizza,
    extras,
    config,
    escapeHtml,
    formatMoney,
    getMenuItem,
    getExtra,
    getAvailableSizes,
    getDefaultSize,
    sizeLabel,
    allowsExtras,
    allowsModification,
    allowsHamOption,
    defaultHamOption,
    hamOptionLabel,
    displayDescription,
    supplementPrice,
    formatPriceRange,
    itemUnitPrice,
    itemTotal,
    itemsSubtotal,
    categorySubtotals,
    pizzaCount,
    articleCount,
    isOrderDay,
    isValidOrderSlot,
    orderTimeSlots,
    isSlotInPast,
    formatTimeLabel,
    deliveryCharge,
    deliveryMinimumWarning,
    orderTotal,
    itemSummary,
    createOrder,
    formatOrderMessage,
  };
})();
