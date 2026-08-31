import { searchAvailableBerths } from "@/lib/search/engine";
import { Ship, MapPin, Calendar, Euro, Navigation, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { MarinasMap } from "@/components/shared/Map";

export default async function RicercaPage({
  searchParams,
}: {
  searchParams: Promise<{ dest?: string; start?: string; end?: string; boat?: string }>;
}) {
  const { dest, start, end, boat } = await searchParams;

  let results: any[] = [];
  let errorMsg = null;

  try {
    if (start && end && boat) {
      results = await searchAvailableBerths({
        destination: dest,
        startDate: start,
        endDate: end,
        boatId: boat,
      });
    }
  } catch (err: any) {
    errorMsg = err.message;
  }

  // Calculate days for price
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  const days = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) : 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Ricerca */}
      <div className="bg-slate-900 text-white py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-2">Risultati Ricerca</h1>
          <div className="flex flex-wrap gap-4 text-sm text-blue-200">
            {dest && <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {dest}</span>}
            {start && end && <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {start} ➔ {end} ({days} notti)</span>}
            {boat && <span className="flex items-center gap-1"><Ship className="h-4 w-4"/> Barca selezionata</span>}
          </div>
        </div>
      </div>

      {/* Main Content (Lista + Mappa) */}
      <div className="flex-1 flex flex-col lg:flex-row h-full">
        
        {/* Lista Risultati */}
        <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto h-[calc(100vh-200px)]">
          <div className="mb-4 text-sm font-semibold text-slate-500">
            {results.length} ormeggi compatibili e disponibili
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-4">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            {results.map((berth) => (
              <div key={berth.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-blue-300 transition-colors group">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{berth.marinas.name}</h3>
                      <p className="text-slate-500 flex items-center gap-1 text-sm mt-1">
                        <MapPin className="h-3 w-3" /> {berth.marinas.city} • {berth.piers.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">€{berth.base_price * days}</div>
                      <div className="text-xs text-slate-400">Totale {days} notti</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-0.5">Posto</div>
                      <div className="font-semibold text-slate-700 text-sm">{berth.code}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-0.5">Lunghezza Max</div>
                      <div className="font-semibold text-slate-700 text-sm">{berth.max_length}m</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-0.5">Larghezza Max</div>
                      <div className="font-semibold text-slate-700 text-sm">{berth.max_width}m</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-0.5">Pescaggio Max</div>
                      <div className="font-semibold text-slate-700 text-sm">{berth.max_draft}m</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/checkout?berth=${berth.id}&start=${start}&end=${end}&boat=${boat}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center">
                      Prenota Ora
                    </Link>
                    <Link href={`/cambusa`} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <ShoppingBasket className="h-4 w-4" /> Aggiungi Cambusa
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {results.length === 0 && !errorMsg && (!start || !end || !boat) ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <Navigation className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Completa la ricerca</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                  {dest 
                    ? `Stai cercando ormeggi a ${dest}. Inserisci le date di arrivo e partenza e seleziona la tua barca per verificare le disponibilità in tempo reale.`
                    : 'Inserisci la destinazione, le date e la tua barca per trovare l\'ormeggio perfetto.'}
                </p>
                <Link href="/" className="inline-flex items-center justify-center h-10 px-6 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                  Torna alla Home
                </Link>
              </div>
            ) : results.length === 0 && !errorMsg && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <Navigation className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Nessun ormeggio trovato</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Non abbiamo trovato posti barca compatibili con le dimensioni della tua imbarcazione o disponibili in queste date. Prova a modificare i filtri di ricerca.
                </p>
                <Link href="/" className="inline-block mt-4 text-blue-600 font-medium hover:underline">
                  Torna alla ricerca
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mappa Reale */}
        <div className="hidden lg:block lg:w-1/2 bg-slate-200 relative border-l border-slate-300">
          <div className="absolute inset-0">
             <MarinasMap markers={Array.from(new Map(results.filter(b => b.marinas.latitude && b.marinas.longitude).map(b => [b.marinas.id, { id: b.marinas.id, latitude: b.marinas.latitude, longitude: b.marinas.longitude, name: b.marinas.name }])).values())} />
          </div>
        </div>

      </div>
    </div>
  );
}
