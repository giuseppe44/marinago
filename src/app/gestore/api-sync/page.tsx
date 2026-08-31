import { createClient } from "@/lib/supabase/server";
import { Link, Webhook, RefreshCcw, Save } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ApiSyncPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let { data: staffRecord } = await supabase
    .from("marina_staff")
    .select("marina_id, marinas(external_system_provider, external_system_id)")
    .eq("user_id", user?.id)
    .single();

  if (!staffRecord) {
    const { data: demoMarina } = await supabase.from("marinas").select("id, external_system_provider, external_system_id").ilike("name", "%Cervo%").limit(1).single();
    if (demoMarina) {
      staffRecord = { marina_id: demoMarina.id, marinas: { external_system_provider: demoMarina.external_system_provider, external_system_id: demoMarina.external_system_id } } as any;
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
          <Webhook className="h-8 w-8 text-indigo-600" />
          Sincronizzazione PMS / API
        </h2>
        <p className="text-slate-500 mt-1">Collega il tuo gestionale interno per sincronizzare le disponibilità in tempo reale.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Configurazione Provider</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sistema Esterno</label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700">
                <option value="">Nessuno (Manuale)</option>
                <option value="NAVILY" selected={m.external_system_provider === 'NAVILY'}>Navily</option>
                <option value="KINETIQ" selected={m.external_system_provider === 'KINETIQ'}>Kinetiq</option>
                <option value="CUSTOM" selected={m.external_system_provider === 'CUSTOM'}>Custom PMS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID Porto Esterno</label>
              <input 
                type="text" 
                defaultValue={m.external_system_id || ''}
                placeholder="es. NAV-12345"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">API Key / Token</label>
              <input 
                type="password" 
                placeholder="••••••••••••••••••••"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Save className="h-4 w-4" /> Salva Configurazione
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800">Stato Sincronizzazione</h4>
            <p className="text-sm text-slate-500 mt-1">Il sistema aggiorna le tariffe e la disponibilità ogni 15 minuti.</p>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-400">Ultimo sync: 5 minuti fa</span>
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                <RefreshCcw className="h-4 w-4" /> Forza Sync
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
