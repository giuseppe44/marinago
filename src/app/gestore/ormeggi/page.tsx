import { createClient } from "@/lib/supabase/server";
import { BerthGrid } from "@/components/gestore/BerthGrid";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function GestoreOrmeggiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Recupera l'ID del marina associato a questo gestore
  const { data: staffRecord } = await supabase
    .from("marina_staff")
    .select("marina_id")
    .eq("user_id", user.id)
    .single();

  if (!staffRecord) return null; // Gestito nel layout

  // Recupera i pontili
  const { data: piers } = await supabase
    .from("piers")
    .select("*")
    .eq("marina_id", staffRecord.marina_id)
    .order("name");

  // Recupera tutti gli ormeggi correnti
  const { data: berths } = await supabase
    .from("berths")
    .select("*")
    .eq("marina_id", staffRecord.marina_id)
    .order("code");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mappa Ormeggi e Tariffe</h2>
          <p className="text-slate-500 text-sm">Gestisci i posti barca in formato rapido. Le modifiche salvate si rifletteranno subito sul motore di ricerca.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm shadow-sm transition-colors">
             Importa da Excel/CSV
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <BerthGrid initialBerths={berths || []} piers={piers || []} marinaId={staffRecord.marina_id} />
      </div>
    </div>
  );
}
