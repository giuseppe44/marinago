"use client";

import { useState } from "react";
import { Search, MapPin, Calendar, Anchor, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSearch({ boats = [] }: { boats?: any[] }) {
  const [searchTab, setSearchTab] = useState<"ormeggio" | "cambusa">("ormeggio");
  const [destVal, setDestVal] = useState("");
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [startDate, setStartDate] = useState("");
  const router = useRouter();

  const marinas = ["Porto Cervo", "Cagliari", "Porto Rotondo", "Olbia", "Villasimius"];

  const filteredMarinas = marinas.filter(m => m.toLowerCase().includes(destVal.toLowerCase()));

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dest = destVal; // We use state for destination now
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
    <div className="w-full max-w-4xl mx-auto -mt-16 sm:-mt-24 relative z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            type="button"
            onClick={() => setSearchTab("ormeggio")}
            className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${searchTab === "ormeggio" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Anchor className="h-4 w-4" />
            Cerca Ormeggio
          </button>
          <button 
            type="button"
            onClick={() => setSearchTab("cambusa")}
            className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${searchTab === "cambusa" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <ShoppingBag className="h-4 w-4" />
            Cambusa & Servizi
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6 sm:p-8">
          {searchTab === "ormeggio" ? (
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Dove vuoi andare?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={destVal}
                    onChange={(e) => setDestVal(e.target.value)}
                    onFocus={() => setShowDestSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                    placeholder="Es. Porto Cervo..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 transition-shadow" 
                    autoComplete="off"
                  />
                  {/* Luxury Dropdown */}
                  {showDestSuggestions && filteredMarinas.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 shadow-xl rounded-lg overflow-hidden z-50">
                      {filteredMarinas.map(m => (
                        <div 
                          key={m} 
                          onClick={() => setDestVal(m)}
                          className="px-4 py-3 cursor-pointer hover:bg-slate-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0"
                        >
                          <MapPin className="h-4 w-4 inline-block mr-2 text-slate-400" />
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Arrivo</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="date" 
                      name="start" 
                      required 
                      min={new Date().toISOString().split('T')[0]} // Block past dates
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm" 
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Partenza</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="date" 
                      name="end" 
                      required 
                      min={startDate || new Date().toISOString().split('T')[0]} // Force start date as min for end date
                      className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">La tua barca</label>
                <div className="relative">
                  <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select name="boat" required className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 appearance-none">
                    <option value="">Seleziona imbarcazione...</option>
                    {boats.map(boat => (
                      <option key={boat.id} value={boat.id}>{boat.name} ({boat.length}m {boat.boat_type || ''})</option>
                    ))}
                    {boats.length === 0 && <option value="" disabled>Nessuna barca salvata</option>}
                  </select>
                </div>
              </div>

              <div className="md:w-32 flex items-end">
                <button type="submit" className="w-full h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-semibold tracking-wide uppercase rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Search className="h-5 w-5" />
                  <span className="md:hidden">Cerca</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 items-end">
               <div className="flex-1 w-full relative">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Consegna in porto</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={destVal}
                    onChange={(e) => setDestVal(e.target.value)}
                    onFocus={() => setShowDestSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                    placeholder="Es. Porto Cervo..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 transition-shadow" 
                    autoComplete="off"
                  />
                  {showDestSuggestions && filteredMarinas.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 shadow-xl rounded-lg overflow-hidden z-50">
                      {filteredMarinas.map(m => (
                        <div 
                          key={m} 
                          onClick={() => setDestVal(m)}
                          className="px-4 py-3 cursor-pointer hover:bg-slate-50 text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0"
                        >
                          <MapPin className="h-4 w-4 inline-block mr-2 text-slate-400" />
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Cosa ti serve?</label>
                <div className="relative">
                  <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Es. Vino, Pulizie..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 transition-shadow" 
                  />
                </div>
              </div>
              <div className="md:w-32 w-full flex items-end">
                <button type="button" onClick={() => router.push('/cambusa')} className="w-full h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-semibold tracking-wide uppercase rounded-lg flex items-center justify-center gap-2 transition-colors">
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
