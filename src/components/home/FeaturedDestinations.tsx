import { MapPin } from "lucide-react";
import Link from "next/link";

export function FeaturedDestinations() {
  const destinations = [
    {
      name: "Porto Cervo",
      image: "https://images.unsplash.com/photo-1566861298642-831e5f3afcb5?q=80&w=2070&auto=format&fit=crop",
      desc: "Il cuore della Costa Smeralda, esclusivo e raffinato.",
    },
    {
      name: "Cagliari",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2070&auto=format&fit=crop",
      desc: "Il capoluogo sardo, perfetto mix tra storia, movida e mare.",
    },
    {
      name: "Porto Rotondo",
      image: "https://images.unsplash.com/photo-1498623116890-37e912163d5d?q=80&w=2070&auto=format&fit=crop",
      desc: "L'eleganza assoluta, tra yacht da sogno e acque turchesi.",
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Destinazioni in evidenza</h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              Scopri i porti più esclusivi e le calette imperdibili della Sardegna, selezionati per te.
            </p>
          </div>
          <Link href="/ormeggi" className="hidden md:inline-block text-blue-600 font-semibold hover:underline mt-4 md:mt-0">
            Vedi tutti i porti &rarr;
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {destinations.map((dest, i) => (
            <Link href={`/ricerca?dest=${encodeURIComponent(dest.name)}`} key={i} className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all block bg-white">
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10" />
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${dest.image}')` }}
                />
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-slate-800">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Sardegna
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{dest.name}</h3>
                <p className="text-slate-600 line-clamp-2">{dest.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
