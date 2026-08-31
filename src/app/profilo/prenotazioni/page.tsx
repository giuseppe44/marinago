import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, MapPin, Ship, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default async function ProfiloPrenotazioniPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id, check_in, check_out, status, total_price,
      marinas (name, city),
      berths (code),
      boats (name)
    `)
    .eq("boater_id", user.id)
    .order("check_in", { ascending: false });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Confermata</span>;
      case 'PENDING': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="h-3 w-3"/> In Attesa</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="h-3 w-3"/> Cancellata</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Le tue Prenotazioni</h1>
        <p className="text-slate-600">
          Visualizza e gestisci le prenotazioni dei tuoi ormeggi.
        </p>
      </div>

      <div className="space-y-4">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{booking.marinas?.name}</h3>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {booking.marinas?.city}</span>
                  <span className="flex items-center gap-1"><Ship className="h-4 w-4"/> {booking.boats?.name}</span>
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">Posto: {booking.berths?.code}</span>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 w-fit">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase">Check-in</div>
                    <div className="font-bold text-slate-700 flex items-center gap-1"><Calendar className="h-3 w-3"/> {booking.check_in}</div>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase">Check-out</div>
                    <div className="font-bold text-slate-700 flex items-center gap-1"><Calendar className="h-3 w-3"/> {booking.check_out}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 min-w-[140px]">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-500 font-semibold uppercase mb-0.5">Totale Pagato</div>
                  <div className="text-2xl font-bold text-blue-600">€{booking.total_price}</div>
                </div>
                <button className="w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                  Dettagli
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Nessuna prenotazione</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Non hai ancora effettuato prenotazioni. Cerca un porto e organizza la tua prossima uscita in barca!
            </p>
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">
              Cerca Ormeggio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
