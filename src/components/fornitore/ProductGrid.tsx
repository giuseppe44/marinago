"use client";

import { useState } from "react";
import { Plus, Save, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ProductGrid({ initialProducts, vendorId }: { initialProducts: any[], vendorId: string }) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{type: "success" | "error" | null, msg: string}>({ type: null, msg: "" });
  const router = useRouter();
  const supabase = createClient();

  const handleAddRow = () => {
    setProducts([
      ...products, 
      { 
        id: `new_${Date.now()}`, 
        vendor_id: vendorId, 
        name: "", 
        category: "Generico",
        price: 0.00, 
        tax_rate: 22.00,
        unit_of_measure: "pz",
        min_order_quantity: 1,
        stock_quantity: -1,
        is_active: true, 
        isNew: true 
      }
    ]);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDelete = async (id: string, isNew?: boolean) => {
    if (isNew) {
      setProducts(products.filter(p => p.id !== id));
      return;
    }
    
    if (confirm("Vuoi davvero eliminare questo prodotto?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        setStatus({ type: "error", msg: error.message });
      } else {
        setProducts(products.filter(p => p.id !== id));
        setStatus({ type: "success", msg: "Prodotto eliminato." });
      }
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setStatus({ type: null, msg: "" });

    try {
      const newProducts = products.filter(p => p.isNew).map(({ id, isNew, ...rest }) => rest);
      const existingProducts = products.filter(p => !p.isNew);

      if (existingProducts.length > 0) {
        const { error } = await supabase.from("products").upsert(existingProducts);
        if (error) throw error;
      }
      
      if (newProducts.length > 0) {
        const { error } = await supabase.from("products").insert(newProducts);
        if (error) throw error;
      }

      setStatus({ type: "success", msg: "Catalogo salvato con successo!" });
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
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <button onClick={handleAddRow} className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors">
          <Plus className="h-4 w-4" /> Aggiungi Prodotto
        </button>
        
        <div className="flex items-center gap-4">
           {status.type === "success" && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> {status.msg}</span>}
           {status.type === "error" && <span className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4"/> {status.msg}</span>}
           
           <button 
             onClick={handleSaveAll}
             disabled={saving}
             className="flex items-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
           >
             <Save className="h-4 w-4" /> {saving ? "Salvataggio..." : "Salva Catalogo"}
           </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider font-semibold">
              <th className="p-3 border-b border-slate-200 w-1/4">Nome Prodotto</th>
              <th className="p-3 border-b border-slate-200">Categoria</th>
              <th className="p-3 border-b border-slate-200">Prezzo (€)</th>
              <th className="p-3 border-b border-slate-200">IVA (%)</th>
              <th className="p-3 border-b border-slate-200">Unità</th>
              <th className="p-3 border-b border-slate-200">Scorta (-1=Illimitata)</th>
              <th className="p-3 border-b border-slate-200">Stato</th>
              <th className="p-3 border-b border-slate-200 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-2">
                  <input 
                    type="text" 
                    value={p.name || ""} 
                    onChange={(e) => handleUpdate(p.id, "name", e.target.value)}
                    className="w-full p-2 text-sm font-semibold bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded outline-none" 
                    placeholder="Es. Vermentino Gallura DOCG"
                  />
                </td>
                <td className="p-2">
                  <select 
                    value={p.category || ""}
                    onChange={(e) => handleUpdate(p.id, "category", e.target.value)}
                    className="w-full p-2 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded outline-none"
                  >
                    <option value="Bevande">Bevande & Vini</option>
                    <option value="Alimentari">Alimentari</option>
                    <option value="Fresco">Fresco (Carne/Pesce)</option>
                    <option value="Servizi">Servizi (Pulizia/Lavanderia)</option>
                    <option value="Generico">Generico</option>
                  </select>
                </td>
                <td className="p-2">
                  <input type="number" step="0.01" value={p.price || ""} onChange={(e) => handleUpdate(p.id, "price", parseFloat(e.target.value))} className="w-24 p-2 text-sm font-bold text-emerald-700 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded outline-none" />
                </td>
                <td className="p-2">
                  <input type="number" step="1" value={p.tax_rate || ""} onChange={(e) => handleUpdate(p.id, "tax_rate", parseFloat(e.target.value))} className="w-16 p-2 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded outline-none" />
                </td>
                <td className="p-2">
                  <select 
                    value={p.unit_of_measure || "pz"}
                    onChange={(e) => handleUpdate(p.id, "unit_of_measure", e.target.value)}
                    className="w-24 p-2 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded outline-none"
                  >
                    <option value="pz">Pezzo</option>
                    <option value="bottiglia">Bottiglia</option>
                    <option value="kg">Kg</option>
                    <option value="confezione">Confezione</option>
                  </select>
                </td>
                <td className="p-2">
                  <input type="number" step="1" value={p.stock_quantity || ""} onChange={(e) => handleUpdate(p.id, "stock_quantity", parseInt(e.target.value))} className="w-20 p-2 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded outline-none" />
                </td>
                <td className="p-2">
                  <select 
                    value={p.is_active ? "true" : "false"}
                    onChange={(e) => handleUpdate(p.id, "is_active", e.target.value === "true")}
                    className={`w-28 p-2 text-sm font-medium border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded outline-none ${p.is_active ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    <option value="true">Attivo</option>
                    <option value="false">Nascosto</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <button onClick={() => handleDelete(p.id, p.isNew)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500 text-sm">
                  Il tuo catalogo è vuoto. Clicca "Aggiungi Prodotto" per iniziare.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
