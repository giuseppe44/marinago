"use client";

import { useState } from "react";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ZoneGrid({ vendorId, allMarinas, activeZones }: { vendorId: string, allMarinas: any[], activeZones: any[] }) {
  // Convertiamo in un oggetto mappa per una gestione più semplice: marina_id -> zoneData
  const initialMap = activeZones.reduce((acc, zone) => {
    acc[zone.marina_id] = { ...zone, isActive: true };
    return acc;
  }, {} as Record<string, any>);

  const [zoneMap, setZoneMap] = useState<Record<string, any>>(initialMap);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{type: "success" | "error" | null, msg: string}>({ type: null, msg: "" });
  const router = useRouter();
  const supabase = createClient();

  const handleToggle = (marinaId: string) => {
    setZoneMap(prev => {
      const current = prev[marinaId];
      if (current) {
        return { ...prev, [marinaId]: { ...current, isActive: !current.isActive } };
      } else {
        return { 
          ...prev, 
          [marinaId]: { 
            marina_id: marinaId, 
            vendor_id: vendorId, 
            delivery_fee: 0, 
            min_order_amount: 50, 
            lead_time_hours: 24, 
            direct_to_berth_available: true,
            isActive: true 
          } 
        };
      }
    });
  };

  const handleUpdate = (marinaId: string, field: string, value: any) => {
    setZoneMap(prev => ({
      ...prev,
      [marinaId]: { ...prev[marinaId], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: null, msg: "" });

    try {
      // Zone da salvare/aggiornare
      const toUpsert = Object.values(zoneMap)
        .filter(z => z.isActive)
        .map(({ isActive, ...rest }) => rest);

      // Zone da eliminare (se disattivate ma prima c'erano)
      const toDeleteIds = Object.values(zoneMap)
        .filter(z => !z.isActive)
        .map(z => z.marina_id);

      if (toUpsert.length > 0) {
        const { error } = await supabase.from("marina_vendors").upsert(toUpsert);
        if (error) throw error;
      }

      if (toDeleteIds.length > 0) {
        const { error } = await supabase.from("marina_vendors")
          .delete()
          .eq("vendor_id", vendorId)
          .in("marina_id", toDeleteIds);
        if (error) throw error;
      }

      setStatus({ type: "success", msg: "Mappatura zone di consegna aggiornata!" });
      router.refresh();
      setTimeout(() => setStatus({ type: null, msg: "" }), 3000);
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <p className="text-sm text-slate-500 max-w-xl">
          Attiva i porti in cui desideri effettuare consegne. Per ogni porto puoi impostare regole diverse di costo e tempistica.
        </p>
        <div className="flex items-center gap-4">
           {status.type === "success" && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> {status.msg}</span>}
           {status.type === "error" && <span className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4"/> {status.msg}</span>}
           
           <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
           >
             <Save className="h-4 w-4" /> {saving ? "Salvataggio..." : "Salva Regole Consegna"}
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {allMarinas.map((marina) => {
          const zone = zoneMap[marina.id];
          const isActive = zone?.isActive || false;

          return (
            <div key={marina.id} className={`p-5 rounded-xl border transition-colors ${isActive ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={isActive}
                    onChange={() => handleToggle(marina.id)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800">{marina.name}</h4>
                    <p className="text-xs text-slate-500">{marina.city}</p>
                  </div>
                </div>
                {isActive && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">Servizio Attivo</span>
                )}
              </div>

              {isActive && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-blue-100/50">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Costo Consegna (€)</label>
                    <input 
                      type="number" step="0.5" 
                      value={zone.delivery_fee || 0} 
                      onChange={(e) => handleUpdate(marina.id, 'delivery_fee', parseFloat(e.target.value))}
                      className="w-full p-2 text-sm bg-white border border-slate-200 rounded focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Ordine Minimo (€)</label>
                    <input 
                      type="number" step="1" 
                      value={zone.min_order_amount || 0} 
                      onChange={(e) => handleUpdate(marina.id, 'min_order_amount', parseFloat(e.target.value))}
                      className="w-full p-2 text-sm bg-white border border-slate-200 rounded focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Preavviso (Ore)</label>
                    <input 
                      type="number" step="1" 
                      value={zone.lead_time_hours || 24} 
                      onChange={(e) => handleUpdate(marina.id, 'lead_time_hours', parseInt(e.target.value))}
                      className="w-full p-2 text-sm bg-white border border-slate-200 rounded focus:border-blue-500 outline-none" 
                      title="Quante ore prima dell'orario di consegna deve essere fatto l'ordine?"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 p-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={zone.direct_to_berth_available} 
                        onChange={(e) => handleUpdate(marina.id, 'direct_to_berth_available', e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      Consegna a Bordo
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
