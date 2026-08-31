import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Ship, Calendar, MapPin, CreditCard, ShieldCheck } from "lucide-react";
import { processCheckout } from "./actions";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ berth: string; start: string; end: string; boat: string }>;
}) {
  const { berth, start, end, boat } = await searchParams;
  
  if (!berth || !start || !end || !boat) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Recupero dati ormeggio e marina
  const { data: berthData } = await supabase
    .from("berths")
    .select(`
      *,
      marinas (id, name, city)
    `)
    .eq("id", berth)
    .single();

  // 2. Recupero dati barca
  const { data: boatData } = await supabase
    .from("boats")
    .select("*")
    .eq("id", boat)
    .single();

  if (!berthData || !boatData) {
    return <div className="p-8 text-center text-red-600">Errore: dati non trovati.</div>;
  }

  // Calcolo Notti e Prezzo
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const totalPrice = berthData.base_price * days;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Completa la prenotazione</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Dettagli Soggiorno</h2>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="flex-1 bg-slate-50 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Check-in</div>
                  <div className="font-bold text-slate-800 flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-600"/> {start}</div>
                  <div className="text-sm text-slate-500 mt-1">Dalle 14:00</div>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Check-out</div>
                  <div className="font-bold text-slate-800 flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-600"/> {end}</div>
                  <div className="text-sm text-slate-500 mt-1">Entro le 11:00</div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 mt-8">La tua Imbarcazione</h2>
              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <Ship className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-bold text-slate-900">{boatData.name}</div>
                  <div className="text-sm text-blue-800">
                    {boatData.length}m x {boatData.width}m (Pescaggio: {boatData.draft}m)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Pagamento (Simulato)</h2>
               <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm border border-orange-200 mb-4 flex gap-3">
                 <ShieldCheck className="h-6 w-6 flex-shrink-0" />
                 <p>In questa fase stiamo collaudando il motore di prenotazione. Cliccando su "Conferma" il pagamento sarà considerato fittiziamente concluso con successo.</p>
               </div>
            </div>
          </div>

          {/* Riepilogo Costi (Sidebar) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Riepilogo Costi</h2>
            
            <div className="mb-4 pb-4 border-b border-slate-100">
              <div className="font-bold text-slate-900 mb-1">{berthData.marinas.name}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1 mb-2"><MapPin className="h-3 w-3"/> {berthData.marinas.city}</div>
              <div className="text-sm bg-slate-100 inline-block px-2 py-1 rounded font-medium text-slate-600">Posto: {berthData.code}</div>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>€{berthData.base_price} x {days} notti</span>
                <span>€{totalPrice}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tasse e commissioni</span>
                <span>Incluse</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-800">Totale (EUR)</span>
                <span className="text-2xl font-bold text-blue-600">€{totalPrice}</span>
              </div>
            </div>

            <form action={processCheckout}>
              <input type="hidden" name="berthId" value={berthData.id} />
              <input type="hidden" name="boatId" value={boatData.id} />
              <input type="hidden" name="marinaId" value={berthData.marina_id} />
              <input type="hidden" name="checkIn" value={start} />
              <input type="hidden" name="checkOut" value={end} />
              <input type="hidden" name="berthPrice" value={berthData.base_price} />
              <input type="hidden" name="totalPrice" value={totalPrice} />
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2">
                <CreditCard className="h-5 w-5" /> Conferma e Paga
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
