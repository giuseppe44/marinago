import { createClient } from "@/lib/supabase/server";
import { Settings, Save, MapPin } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ImpostazioniPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let { data: staffRecord } = await supabase
    .from("marina_staff")
    .select("marina_id, marinas(*)")
    .eq("user_id", user?.id)
    .single();

  if (!staffRecord) {
    const { data: demoMarina } = await supabase.from("marinas").select("*").ilike("name", "%Cervo%").limit(1).single();
    if (demoMarina) {
      staffRecord = { marina_id: demoMarina.id, marinas: demoMarina } as any;
    } else {
      return null;
    }
  }

  if (!staffRecord) return null;

  const m = staffRecord.marinas as any;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-slate-700" />
          Impostazioni Porto
        </h2>
        <p className="text-slate-500 mt-1">Modifica le informazioni pubbliche e le regole di prenotazione.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Informazioni Generali</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome del Marina</label>
              <input 
                type="text" 
                defaultValue={m.name || ''}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Città</label>
                <input 
                  type="text" 
                  defaultValue={m.city || ''}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Indirizzo Completo
                </label>
                <input 
                  type="text" 
                  defaultValue={m.address || ''}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <h3 className="text-lg font-bold text-slate-800">Regole di Prenotazione</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Modalità di Accettazione</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex-1 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-500 transition-colors flex items-start gap-3">
                  <input type="radio" name="booking_mode" value="LIVE" defaultChecked={m.booking_mode === 'LIVE'} className="mt-1" />
                  <div>
                    <div className="font-bold text-slate-900">Prenotazione Diretta (LIVE)</div>
                    <div className="text-sm text-slate-500">I diportisti possono prenotare e pagare istantaneamente se c'è disponibilità.</div>
                  </div>
                </label>
                <label className="flex-1 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-500 transition-colors flex items-start gap-3">
                  <input type="radio" name="booking_mode" value="ON_REQUEST" defaultChecked={m.booking_mode === 'ON_REQUEST'} className="mt-1" />
                  <div>
                    <div className="font-bold text-slate-900">Su Richiesta</div>
                    <div className="text-sm text-slate-500">Devi approvare manualmente ogni singola richiesta prima del pagamento.</div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
              <Save className="h-4 w-4" /> Salva Modifiche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
