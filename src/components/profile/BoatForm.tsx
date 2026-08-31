"use client";

import { useState } from "react";
import { addBoat } from "@/app/profilo/barche/actions";
import { Anchor } from "lucide-react";

export function BoatForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    try {
      await addBoat(formData);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Anchor className="h-5 w-5 text-blue-600" />
        Aggiungi una nuova barca
      </h3>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm mb-4">Barca aggiunta con successo!</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Imbarcazione *</label>
            <input type="text" name="name" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipologia *</label>
            <select name="boat_type" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="VELA">Barca a Vela</option>
              <option value="MOTORE">Barca a Motore</option>
              <option value="CATAMARANO">Catamarano</option>
              <option value="GOMMONE">Gommone</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lunghezza (m) *</label>
            <input type="number" step="0.01" name="length" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="es. 12.50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Larghezza (m) *</label>
            <input type="number" step="0.01" name="width" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="es. 4.20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pescaggio (m) *</label>
            <input type="number" step="0.01" name="draft" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="es. 2.10" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Altezza (m) <span className="text-slate-400 font-normal">(opzionale)</span></label>
            <input type="number" step="0.01" name="height" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Passeggeri <span className="text-slate-400 font-normal">(opzionale)</span></label>
            <input type="number" name="passengers_capacity" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bandiera <span className="text-slate-400 font-normal">(opzionale)</span></label>
            <input type="text" name="flag" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="es. IT" />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Salvataggio..." : "Salva Barca"}
          </button>
        </div>
      </form>
    </div>
  );
}
