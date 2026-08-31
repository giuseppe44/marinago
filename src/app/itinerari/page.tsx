import { Map, Clock, Sun } from "lucide-react";
import Link from "next/link";

export default function ItinerariPage() {
  const itinerari = [
    {
      title: "Arcipelago della Maddalena",
      days: 3,
      desc: "Un viaggio tra le isole più affascinanti: Spargi, Budelli, Santa Maria. Acque turchesi e rocce scolpite dal vento.",
      image: "https://images.unsplash.com/photo-1574512964098-958869c84964?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Costa Smeralda Tour",
      days: 2,
      desc: "Da Porto Cervo a Cala di Volpe, esplorando l'esclusività e le calette più glamour del mondo.",
      image: "https://images.unsplash.com/photo-1544325969-9836eb4407b3?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Sud Sardegna: Da Villasimius a Chia",
      days: 5,
      desc: "Spiagge bianche, fari antichi e mare incontaminato lungo la costa meridionale dell'isola.",
      image: "https://images.unsplash.com/photo-1533228876403-518fa10066ba?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Itinerari in Sardegna</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Scopri i percorsi più belli studiati dai nostri esperti. Lasciati ispirare per la tua prossima vacanza in barca.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {itinerari.map((it, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-56 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${it.image}')` }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 mb-3">
                  <Clock className="h-4 w-4" />
                  {it.days} giorni
                  <span className="mx-2 text-slate-300">|</span>
                  <Sun className="h-4 w-4" />
                  Estate
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{it.title}</h3>
                <p className="text-slate-600 mb-6">{it.desc}</p>
                
                <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  <Map className="h-5 w-5" />
                  Pianifica viaggio
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
