"use client";

import { useState } from "react";
import { Search, MapPin, Calendar, Anchor, ShoppingBasket } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSearch({ boats = [] }: { boats?: any[] }) {
  const [searchTab, setSearchTab] = useState<"ormeggio" | "cambusa">("ormeggio");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dest = formData.get("destination") as string;
    const start = formData.get("start") as string;
    const end = formData.get("end") as string;
    const boat = formData.get("boat") as string;

    if (!start || !end) {
      alert("Seleziona data di arrivo e partenza");
      return;
    }
    if (!boat) {
      alert("Seleziona una barca per verificare la compatibilità");
      return;
    }

    const params = new URLSearchParams();
    if (dest) params.append("dest", dest);
    params.append("start", start);
    params.append("end", end);
    params.append("boat", boat);

    router.push(`/ricerca?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto -mt-16 sm:-mt-24 relative z-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            type="button"
            onClick={() => setSearchTab("ormeggio")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${searchTab === "ormeggio" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Anchor className="h-4 w-4" />
            Cerca Ormeggio
          </button>
          <button 
            type="button"
            onClick={() => setSearchTab("cambusa")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${searchTab === "cambusa" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <ShoppingBasket className="h-4 w-4" />
            Cambusa & Servizi
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6 sm:p-8">
          {searchTab === "ormeggio" ? (
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dove vuoi andare?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input type="text" name="destination" placeholder="Località, porto, area..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                </div>
              </div>
              
              <div className="flex-1 flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Arrivo</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="date" name="start" required className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Partenza</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="date" name="end" required className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">La tua barca</label>
                <div className="relative">
                  <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select name="boat" required className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                    <option value="">Seleziona...</option>
                    {boats.map(boat => (
                      <option key={boat.id} value={boat.id}>{boat.name} ({boat.length}m)</option>
                    ))}
                    {boats.length === 0 && <option value="" disabled>Nessuna barca salvata</option>}
                  </select>
                </div>
              </div>

              <div className="md:w-32 flex items-end">
                <button type="submit" className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Search className="h-5 w-5" />
                  <span className="md:hidden">Cerca Ormeggio</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 items-end">
               <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Consegna a bordo in porto</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input type="text" placeholder="Seleziona il porto di consegna..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cosa ti serve?</label>
                <div className="relative">
                  <ShoppingBasket className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input type="text" placeholder="Es. Vino, ghiaccio, carne..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                </div>
              </div>
              <div className="md:w-32 w-full">
                <button type="button" className="w-full h-[50px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Search className="h-5 w-5" />
                  <span className="md:hidden">Cerca</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
