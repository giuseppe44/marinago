"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const checkoutSchema = z.object({
  berthId: z.string().uuid(),
  boatId: z.string().uuid(),
  marinaId: z.string().uuid(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  berthPrice: z.number().positive(),
  totalPrice: z.number().positive()
});

export async function processCheckout(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Utente non autenticato");

  // Validazione Zod
  const rawData = {
    berthId: formData.get("berthId"),
    boatId: formData.get("boatId"),
    marinaId: formData.get("marinaId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    berthPrice: parseFloat(formData.get("berthPrice") as string),
    totalPrice: parseFloat(formData.get("totalPrice") as string)
  };

  const parsed = checkoutSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error("Dati di prenotazione non validi: " + parsed.error.message);
  }

  const { berthId, boatId, marinaId, checkIn, checkOut, berthPrice, totalPrice } = parsed.data;

  // Qui creeremmo l'intento di pagamento con Stripe/Nexi
  // Per ora simuliamo un pagamento andato a buon fine passando direttamente a CONFIRMED o PAYMENT_PENDING

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      boater_id: user.id,
      marina_id: marinaId,
      berth_id: berthId,
      boat_id: boatId,
      check_in: checkIn,
      check_out: checkOut,
      berth_price: berthPrice,
      total_price: totalPrice,
      status: "CONFIRMED", // Simula pagamento riuscito
      currency: "EUR"
    })
    .select("id")
    .single();

  if (error) {
    // Se scatta il vincolo EXCLUDE, l'errore avrà un codice specifico (spesso 23P01 per exclusion_violation)
    if (error.message.includes("prevent_overlapping_bookings") || error.code === '23P01') {
      throw new Error("Siamo spiacenti, l'ormeggio è appena stato prenotato per queste date da un altro utente.");
    }
    throw new Error(error.message);
  }

  // Se è andata a buon fine, navighiamo alla pagina di successo
  revalidatePath("/gestore/prenotazioni");
  revalidatePath("/profilo/prenotazioni");
  
  redirect(`/checkout/success?booking=${booking.id}`);
}
