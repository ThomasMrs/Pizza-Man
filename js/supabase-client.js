(function () {
  const supabaseUrl = "https://mqaxjswqchyjgtqlcwxw.supabase.co";
  const supabasePublishableKey = "sb_publishable_EtM2Tfnx9MHftKx-2PjIcw_wz-tcroy";

  const client =
    window.supabase && supabaseUrl && supabasePublishableKey
      ? window.supabase.createClient(supabaseUrl, supabasePublishableKey)
      : null;

  function isDuplicateInsert(error) {
    return error && (error.code === "23505" || String(error.message || "").includes("duplicate key"));
  }

  function toRow(order, source = "site") {
    return {
      id: order.id,
      created_at: order.createdAt || new Date().toISOString(),
      status: order.status || "À faire",
      customer: order.customer || {},
      items: order.items || [],
      total_amount: PizzaMan.orderTotal(order),
      delivery_charge: PizzaMan.deliveryCharge(order),
      source,
    };
  }

  function fromRow(row) {
    return {
      id: row.id,
      createdAt: row.created_at,
      status: row.status || "À faire",
      customer: row.customer || {},
      items: row.items || [],
    };
  }

  async function getSession() {
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function signIn(email, password) {
    if (!client) throw new Error("Supabase n'est pas configuré.");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function saveOrder(order, options = {}) {
    if (!client) {
      const orders = PizzaMan.loadOrders();
      if (!orders.some((existingOrder) => existingOrder.id === order.id)) {
        PizzaMan.saveOrders([order, ...orders]);
      }
      return { order, stored: "local" };
    }

    const { error } = await client.from("orders").insert(toRow(order, options.source || "site"));
    if (error && !isDuplicateInsert(error)) throw error;

    return { order, stored: error ? "existing" : "supabase" };
  }

  async function upsertOrder(order, options = {}) {
    if (!client) {
      const orders = PizzaMan.loadOrders();
      const nextOrders = [order, ...orders.filter((existingOrder) => existingOrder.id !== order.id)];
      PizzaMan.saveOrders(nextOrders);
      return { order, stored: "local" };
    }

    const { error } = await client
      .from("orders")
      .upsert(toRow(order, options.source || "pizzeria"), { onConflict: "id" });
    if (error) throw error;
    return { order, stored: "supabase" };
  }

  async function listOrders() {
    if (!client) return PizzaMan.loadOrders();

    const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(fromRow);
  }

  async function updateOrderStatus(id, status) {
    if (!client) {
      const orders = PizzaMan.loadOrders().map((order) => (order.id === id ? { ...order, status } : order));
      PizzaMan.saveOrders(orders);
      return;
    }

    const { error } = await client.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  }

  async function updateOrderCustomer(id, customer) {
    if (!client) {
      const orders = PizzaMan.loadOrders().map((order) => (order.id === id ? { ...order, customer } : order));
      PizzaMan.saveOrders(orders);
      return;
    }

    const { error } = await client.from("orders").update({ customer }).eq("id", id);
    if (error) throw error;
  }

  async function deleteOrder(id) {
    if (!client) {
      PizzaMan.saveOrders(PizzaMan.loadOrders().filter((order) => order.id !== id));
      return;
    }

    const { error } = await client.from("orders").delete().eq("id", id);
    if (error) throw error;
  }

  window.PizzaManDb = {
    client,
    isConfigured: Boolean(client),
    getSession,
    signIn,
    signOut,
    saveOrder,
    upsertOrder,
    listOrders,
    updateOrderStatus,
    updateOrderCustomer,
    deleteOrder,
  };
})();
