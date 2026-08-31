import { createClient } from "@/lib/supabase/server";
import { BoatForm } from "@/components/profile/BoatForm";
import { Ship } from "lucide-react";

export default async function BarchePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // Gestito dal layout/middleware

  // RLS garantirà che vengano lette solo le barche di questo utente
  const { data: boats } = await supabase
    .from("boats")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Le mie barche</h1>
        <p className="text-slate-600">
          Gestisci i dati delle tue imbarcazioni. Le dimensioni (lunghezza, larghezza, pescaggio) verranno 
          utilizzate dal nostro algoritmo per trovarti automaticamente i posti barca compatibili.
        </p>
      </div>

      {/* Lista Barche */}
      <div className="grid gap-4 mb-12">
        {boats && boats.length > 0 ? (
          boats.map((boat) => (
            <div key={boat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <Ship className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{boat.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{boat.boat_type}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-sm">
                  <span className="text-slate-500 text-xs block mb-0.5">Lunghezza</span>
                  <span className="font-semibold text-slate-800">{boat.length}m</span>
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-sm">
                  <span className="text-slate-500 text-xs block mb-0.5">Larghezza</span>
                  <span className="font-semibold text-slate-800">{boat.width}m</span>
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-sm">
                  <span className="text-slate-500 text-xs block mb-0.5">Pescaggio</span>
                  <span className="font-semibold text-slate-800">{boat.draft}m</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <Ship className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nessuna barca salvata.</p>
          </div>
        )}
      </div>

      {/* Form Aggiunta */}
      <BoatForm />
    </div>
  );
}
