"use server";

import { createClient } from "@/lib/supabase/server";

export async function placeCambusaOrder(bookingId: string, marinaId: string, cartByVendor: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Non autenticato");

  // VALIDAZIONE 1: La prenotazione esiste, è dell'utente, ed è attiva e futura?
  const { data: booking } = await supabase
    .from("bookings")
    .select("check_in, status")
    .eq("id", bookingId)
    .eq("boater_id", user.id)
    .single();

  if (!booking) throw new Error("Prenotazione non trovata o non autorizzata");
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    throw new Error("Impossibile ordinare: la prenotazione è scaduta o cancellata.");
  }
  
  const today = new Date().toISOString().split('T')[0];
  if (booking.check_in < today) {
    throw new Error("Impossibile ordinare per una data passata.");
  }

  const deliveryDate = `${booking.check_in}T14:00:00Z`;

  for (const v of cartByVendor) {
    const vendorId = v.vendor.id;

    // VALIDAZIONE 2: Il fornitore consegna in questo porto?
    const { data: deliveryRule } = await supabase
      .from("marina_vendors")
      .select("min_order_amount, delivery_fee")
      .eq("marina_id", marinaId)
      .eq("vendor_id", vendorId)
      .single();

    if (!deliveryRule) {
      throw new Error(`Il fornitore ${v.vendor.name} non consegna nel porto selezionato.`);
    }

    // VALIDAZIONE 3: Calcolo Subtotale REALE leggendo i prezzi dal DB, non fidandosi del client
    const itemIds = v.items.map((i: any) => i.id);
    const { data: realProducts } = await supabase
      .from("products")
      .select("id, price")
      .in("id", itemIds);

    let realSubtotale = 0;
    const itemsToInsert = [];

    for (const clientItem of v.items) {
      const realProduct = realProducts?.find(rp => rp.id === clientItem.id);
      if (!realProduct) throw new Error("Prodotto non valido");
      
      const itemTotal = realProduct.price * clientItem.quantity;
      realSubtotale += itemTotal;
      
      itemsToInsert.push({
        product_id: realProduct.id,
        vendor_id: vendorId,
        quantity: clientItem.quantity,
        unit_price: realProduct.price,
        total_price: itemTotal
      });
    }

    // VALIDAZIONE 4: Controllo Ordine Minimo server-side
    if (realSubtotale < deliveryRule.min_order_amount) {
      throw new Error(`Ordine minimo per ${v.vendor.name} non raggiunto (Richiesto: €${deliveryRule.min_order_amount}).`);
    }

    const finalTotal = realSubtotale + deliveryRule.delivery_fee;

    // INSERIMENTO TRANSAZIONALE
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        boater_id: user.id,
        booking_id: bookingId,
        marina_id: marinaId,
        status: "PAID",
        delivery_date: deliveryDate,
        products_total: realSubtotale,
        delivery_fee: deliveryRule.delivery_fee,
        total_amount: finalTotal,
      })
      .select("id")
      .single();

    if (orderErr) throw new Error(`Errore creazione ordine: ${orderErr.message}`);

    const orderItemsWithOrderId = itemsToInsert.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsErr } = await supabase.from("order_items").insert(orderItemsWithOrderId);
    if (itemsErr) throw new Error(`Errore inserimento prodotti: ${itemsErr.message}`);
  }

  return { success: true };
}
