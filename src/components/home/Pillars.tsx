import { Anchor, Map, ShoppingBasket, Wrench } from "lucide-react";

export function Pillars() {
  const pillars = [
    {
      title: "Trova un ormeggio",
      description: "Confronta e prenota in tempo reale nei migliori porti della Sardegna.",
      icon: <Anchor className="h-8 w-8 text-blue-600" />,
      color: "bg-blue-50"
    },
    {
      title: "Scopri la Sardegna in barca",
      description: "Pianifica il tuo itinerario ideale tra baie nascoste e approdi esclusivi.",
      icon: <Map className="h-8 w-8 text-indigo-600" />,
      color: "bg-indigo-50"
    },
    {
      title: "Prepara la tua cambusa",
      description: "Ordina cibo, vino e prodotti tipici sardi con consegna direttamente a bordo.",
      icon: <ShoppingBasket className="h-8 w-8 text-emerald-600" />,
      color: "bg-emerald-50"
    },
    {
      title: "Servizi per la tua barca",
      description: "Prenota pulizia, assistenza tecnica o transfer prima del tuo arrivo.",
      icon: <Wrench className="h-8 w-8 text-orange-600" />,
      color: "bg-orange-50"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Molto più di un semplice posto barca</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            MARINAGO è il tuo concierge digitale per vivere il mare della Sardegna senza pensieri.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <div key={index} className="p-8 rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow bg-white group cursor-pointer">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${pillar.color}`}>
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
