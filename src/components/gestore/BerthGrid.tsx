"use client";

import { useState } from "react";
import { Plus, Save, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function BerthGrid({ initialBerths, piers, marinaId }: { initialBerths: any[], piers: any[], marinaId: string }) {
  const [berths, setBerths] = useState<any[]>(initialBerths);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{type: "success" | "error" | null, msg: string}>({ type: null, msg: "" });
  const router = useRouter();
  const supabase = createClient();

  const handleAddRow = () => {
    setBerths([
      ...berths, 
      { id: `new_${Date.now()}`, marina_id: marinaId, pier_id: piers[0]?.id || null, code: "", max_length: 10, max_width: 3.5, max_draft: 2, base_price: 50, status: "AVAILABLE", isNew: true }
    ]);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    setBerths(berths.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleDelete = async (id: string, isNew?: boolean) => {
    if (isNew) {
      setBerths(berths.filter(b => b.id !== id));
      return;
    }
    
    if (confirm("Vuoi davvero eliminare questo ormeggio? Se ha prenotazioni attive, l'operazione fallirà.")) {
      const { error } = await supabase.from("berths").delete().eq("id", id);
      if (error) {
        setStatus({ type: "error", msg: error.message });
      } else {
        setBerths(berths.filter(b => b.id !== id));
        setStatus({ type: "success", msg: "Ormeggio eliminato." });
      }
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setStatus({ type: null, msg: "" });

    try {
      // Separiamo nuovi da esistenti
      const newBerths = berths.filter(b => b.isNew).map(({ id, isNew, ...rest }) => rest);
      const existingBerths = berths.filter(b => !b.isNew);

      // Upsert
      if (existingBerths.length > 0) {
        const { error } = await supabase.from("berths").upsert(existingBerths);
        if (error) throw error;
      }
      
      // Insert
      if (newBerths.length > 0) {
        const { error } = await supabase.from("berths").insert(newBerths);
        if (error) throw error;
      }

      setStatus({ type: "success", msg: "Tutti i dati salvati con successo!" });
      router.refresh();
      
      // Rimuoviamo il flag isNew fittizio ricaricando dal server
      setTimeout(() => setStatus({ type: null, msg: "" }), 3000);
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <button onClick={handleAddRow} className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors">
          <Plus className="h-4 w-4" /> Aggiungi Riga
        </button>
        
        <div className="flex items-center gap-4">
           {status.type === "success" && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> {status.msg}</span>}
           {status.type === "error" && <span className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4"/> {status.msg}</span>}
           
           <button 
             onClick={handleSaveAll}
             disabled={saving}
             className="flex items-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
           >
             <Save className="h-4 w-4" /> {saving ? "Salvataggio..." : "Salva Modifiche"}
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <th className="p-3 border-b border-slate-200">Pontile/Area</th>
              <th className="p-3 border-b border-slate-200">Codice Posto</th>
              <th className="p-3 border-b border-slate-200">Lung. Max (m)</th>
              <th className="p-3 border-b border-slate-200">Larg. Max (m)</th>
              <th className="p-3 border-b border-slate-200">Pescaggio (m)</th>
              <th className="p-3 border-b border-slate-200">Prezzo Base (€)</th>
              <th className="p-3 border-b border-slate-200">Stato Operativo</th>
              <th className="p-3 border-b border-slate-200 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {berths.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-2">
                  <select 
                    value={b.pier_id || ""}
                    onChange={(e) => handleUpdate(b.id, "pier_id", e.target.value)}
                    className="w-full p-2 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none"
                  >
                    {piers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    <option value="">Nessuno (Transito)</option>
                  </select>
                </td>
                <td className="p-2">
                  <input 
                    type="text" 
                    value={b.code || ""} 
                    onChange={(e) => handleUpdate(b.id, "code", e.target.value)}
                    className="w-24 p-2 text-sm font-semibold bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" 
                    placeholder="Es. A-12"
                  />
                </td>
                <td className="p-2">
                  <input type="number" step="0.1" value={b.max_length || ""} onChange={(e) => handleUpdate(b.id, "max_length", parseFloat(e.target.value))} className="w-20 p-2 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" />
                </td>
                <td className="p-2">
                  <input type="number" step="0.1" value={b.max_width || ""} onChange={(e) => handleUpdate(b.id, "max_width", parseFloat(e.target.value))} className="w-20 p-2 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" />
                </td>
                <td className="p-2">
                  <input type="number" step="0.1" value={b.max_draft || ""} onChange={(e) => handleUpdate(b.id, "max_draft", parseFloat(e.target.value))} className="w-20 p-2 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" />
                </td>
                <td className="p-2">
                  <input type="number" step="1" value={b.base_price || ""} onChange={(e) => handleUpdate(b.id, "base_price", parseFloat(e.target.value))} className="w-24 p-2 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none" />
                </td>
                <td className="p-2">
                  <select 
                    value={b.status || "AVAILABLE"}
                    onChange={(e) => handleUpdate(b.id, "status", e.target.value)}
                    className={`w-32 p-2 text-sm font-medium border border-transparent hover:border-slate-300 focus:border-blue-500 rounded outline-none ${b.status === 'AVAILABLE' ? 'text-emerald-600' : 'text-orange-600'}`}
                  >
                    <option value="AVAILABLE">Operativo</option>
                    <option value="MAINTENANCE">Manutenzione</option>
                    <option value="UNAVAILABLE">Chiuso</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <button onClick={() => handleDelete(b.id, b.isNew)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {berths.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500 text-sm">
                  Nessun ormeggio configurato. Clicca "Aggiungi Riga" per iniziare.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
