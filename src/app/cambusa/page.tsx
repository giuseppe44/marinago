import { createClient } from "@/lib/supabase/server";
import { Ship, Calendar, MapPin, ShoppingBasket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CambusaSelectorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Recupera le prenotazioni future dell'utente
  const today = new Date().toISOString().split('T')[0];
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id, check_in, check_out, status,
      marinas (name, city),
      boats (name)
    `)
    .eq("boater_id", user.id)
    .gte("check_in", today)
    .in("status", ["CONFIRMED", "PAYMENT_PENDING", "PENDING"])
    .order("check_in", { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <div className="bg-emerald-100 text-emerald-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBasket className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">CAMBUSA</h1>
          <p className="text-xl text-slate-600 font-medium">Ordina oggi. Trova tutto a bordo al tuo arrivo.</p>
          <p className="text-sm text-slate-500 mt-4 max-w-2xl mx-auto">
            Seleziona una delle tue prossime soste in porto. Il sistema ti mostrerà i migliori fornitori locali (cantine, macellerie, catering) che garantiscono la consegna diretta al tuo ormeggio, esattamente quando arrivi.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Le tue prossime soste in porto</h2>
          
          {bookings && bookings.length > 0 ? (
            bookings.map((booking: any) => (
              <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{booking.marinas?.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-slate-400"/> {booking.marinas?.city}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-slate-400"/> {booking.check_in}</span>
                    <span className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-medium"><Ship className="h-4 w-4"/> {booking.boats?.name}</span>
                  </div>
                </div>
                
                <Link 
                  href={`/cambusa/${booking.id}`} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Rifornisci Barca <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))
          ) : (
             <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
               <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
               <h3 className="text-lg font-semibold text-slate-700 mb-1">Nessuna sosta imminente</h3>
               <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                 Per ordinare la cambusa a bordo devi prima avere una prenotazione confermata in un porto.
               </p>
               <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">
                 Cerca Ormeggio
               </Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
