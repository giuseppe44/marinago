import { createClient } from "@/lib/supabase/server";
import { MarinasMap } from "@/components/shared/Map";
import { Anchor, MapPin } from "lucide-react";
import Link from "next/link";

export default async function OrmeggiPage() {
  const supabase = await createClient();
  
  // Fetch all marinas
  const { data: marinas } = await supabase.from("marinas").select("*").order("name");
  
  const safeMarinas = marinas || [];
  
  const markers = safeMarinas
    .filter(m => m.latitude && m.longitude)
    .map(m => ({
      id: m.id,
      latitude: m.latitude,
      longitude: m.longitude,
      name: m.name
    }));

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Porti & Ormeggi in Sardegna</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Esplora la rete dei nostri porti affiliati. Visualizza le loro posizioni sulla mappa e scopri i servizi offerti.
          </p>
        </div>

        {/* Map Section */}
        <div className="mb-16">
          <MarinasMap markers={markers} />
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeMarinas.map((marina) => (
            <div key={marina.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-slate-100 relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1575027582531-1e967a5b3a4f?q=80&w=800&auto=format&fit=crop")' }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{marina.name.replace('[DEMO] ', '')}</h3>
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{marina.city}</span>
                </div>
                <Link 
                  href={`/ricerca?dest=${encodeURIComponent(marina.city)}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Anchor className="h-4 w-4" />
                  Cerca Ormeggi
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {safeMarinas.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            Nessun porto trovato.
          </div>
        )}

      </div>
    </div>
  );
}
