import { createClient } from "@/lib/supabase/server";
import { CalendarDays, Lock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let { data: staffRecord } = await supabase
    .from("marina_staff")
    .select("marina_id, marinas(name)")
    .eq("user_id", user?.id)
    .single();

  if (!staffRecord) {
    const { data: demoMarina } = await supabase.from("marinas").select("id, name").ilike("name", "%Cervo%").limit(1).single();
    if (demoMarina) {
      staffRecord = { marina_id: demoMarina.id, marinas: { name: demoMarina.name } } as any;
    } else {
      return null;
    }
  }

  if (!staffRecord) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <CalendarDays className="h-8 w-8 text-blue-600" />
          Calendario & Disponibilità
        </h2>
        <p className="text-slate-500 mt-1">Gestisci le aperture, le chiusure stagionali e i prezzi dinamici.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Modulo in Sviluppo Avanzato</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          La griglia del calendario interattivo per gestire le disponibilità giornaliere e applicare blocchi di tariffazione stagionale sarà rilasciata nella prossima versione dell'MVP.
        </p>
        <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg shadow-sm opacity-50 cursor-not-allowed">
          Sblocca Calendario Interattivo
        </button>
      </div>
    </div>
  );
}
