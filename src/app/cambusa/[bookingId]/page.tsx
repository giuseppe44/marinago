import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CambusaStore } from "@/components/cambusa/CambusaStore";
import { ShoppingBasket, Anchor } from "lucide-react";

export default async function CambusaShopPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Recupera la prenotazione (assicurandosi che sia dell'utente)
  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .select(`
      id, check_in, check_out, marinas(id, name, city), boats(name), berths(code)
    `)
    .eq("id", bookingId)
    .eq("boater_id", user.id)
    .single();

  if (bookingErr || !booking) {
    return <div className="p-8 text-center text-red-600">Prenotazione non trovata o non autorizzata.</div>;
  }

  // 2. Recupera i fornitori che consegnano in questo porto, con le loro regole
  const marinas: any = booking.marinas;
  const boats: any = booking.boats;
  const berths: any = booking.berths;

  const { data: vendorsRules } = await supabase
    .from("marina_vendors")
    .select(`
      delivery_fee, min_order_amount, lead_time_hours, direct_to_berth_available,
      vendors (id, name, vendor_type, description)
    `)
    .eq("marina_id", marinas.id);

  if (!vendorsRules || vendorsRules.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 text-center">
         <ShoppingBasket className="h-16 w-16 text-slate-300 mx-auto mb-4" />
         <h1 className="text-2xl font-bold text-slate-900 mb-2">Nessun fornitore disponibile</h1>
         <p className="text-slate-500">Al momento non ci sono fornitori partner attivi per il porto di {marinas.name}.</p>
      </div>
    );
  }

  // Estraiamo gli ID dei vendor per filtrare i prodotti
  const vendorIds = vendorsRules.map((vr: any) => vr.vendors.id);

  // 3. Recupera i prodotti attivi di questi fornitori
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("vendor_id", vendorIds)
    .eq("is_active", true);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Personalizzato per la Prenotazione */}
      <div className="bg-slate-900 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
              <ShoppingBasket className="h-5 w-5" /> CAMBUSA B2C
            </div>
            <h1 className="text-2xl font-bold">Rifornimento per {boats.name}</h1>
            <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
              <Anchor className="h-4 w-4"/>
              Consegna a: {marinas.name}, Posto {berths?.code || "TBD"} (Arrivo: {booking.check_in})
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 py-8">
        {/* Passiamo i dati al Client Component che gestirà il Carrello Multi-Vendor */}
        <CambusaStore 
          booking={booking} 
          vendorsRules={vendorsRules} 
          products={products || []} 
        />
      </div>
    </div>
  );
}
