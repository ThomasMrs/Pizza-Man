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
      service_date: PizzaMan.orderServiceDate(order),
      order_slot: PizzaMan.orderSlotValue(order) || null,
      pizza_count: PizzaMan.pizzaCount(order),
      source,
    };
  }

  function fromRow(row) {
    const customer = row.customer || {};
    return {
      id: row.id,
      createdAt: row.created_at,
      status: row.status || "À faire",
      customer: {
        ...customer,
        serviceDate: customer.serviceDate || row.service_date || PizzaMan.todayServiceDate(new Date(row.created_at)),
        desiredTime: customer.desiredTime || (!customer.plannedTime ? row.order_slot || "" : ""),
        plannedTime: customer.plannedTime || "",
      },
      items: row.items || [],
    };
  }

  async function getSession() {
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function signIn(identifier, password) {
    if (!client) throw new Error("Supabase n'est pas configuré.");
    const email = String(identifier || "").trim();
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

  async function listSlotUsage(serviceDate = PizzaMan.todayServiceDate()) {
    if (!client) {
      return Array.from(PizzaMan.slotUsageFromOrders(PizzaMan.loadOrders(), serviceDate).entries()).map(
        ([slot, pizzaCount]) => ({ slot, pizzaCount }),
      );
    }

    const { data, error } = await client.rpc("get_order_slot_usage", { service_date_arg: serviceDate });
    if (error) throw error;
    return (data || []).map((row) => ({
      slot: row.slot_time,
      pizzaCount: Number(row.pizza_count || 0),
    }));
  }

  async function upsertOrder(order, options = {}) {
    if (!client) throw new Error("Supabase n'est pas configuré.");

    const { error } = await client
      .from("orders")
      .upsert(toRow(order, options.source || "pizzeria"), { onConflict: "id" });
    if (error) throw error;
    return { order, stored: "supabase" };
  }

  async function listOrders(serviceDate = PizzaMan.todayServiceDate()) {
    if (!client) throw new Error("Supabase n'est pas configuré.");

    const { data, error } = await client
      .from("orders")
      .select("*")
      .eq("service_date", serviceDate)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(fromRow);
  }

  async function updateOrderStatus(id, status) {
    if (!client) throw new Error("Supabase n'est pas configuré.");

    const { error } = await client.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  }

  async function updateOrderCustomer(id, customer) {
    if (!client) throw new Error("Supabase n'est pas configuré.");

    const orderSlot = customer.plannedTime || customer.desiredTime || null;
    const { error } = await client
      .from("orders")
      .update({
        customer,
        service_date: customer.serviceDate || PizzaMan.todayServiceDate(),
        order_slot: PizzaMan.isValidOrderSlot(orderSlot) ? orderSlot : null,
      })
      .eq("id", id);
    if (error) throw error;
  }

  async function deleteOrder(id) {
    if (!client) throw new Error("Supabase n'est pas configuré.");

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
    listSlotUsage,
    upsertOrder,
    listOrders,
    updateOrderStatus,
    updateOrderCustomer,
    deleteOrder,
  };
})();
