import { Anchor, Compass, ShoppingBag, Sparkles } from "lucide-react";

export function Pillars() {
  const pillars = [
    {
      title: "Ormeggi Premium",
      description: "Confronta e prenota in tempo reale nei marina più esclusivi della Sardegna.",
      icon: <Anchor strokeWidth={1.5} className="h-10 w-10 text-slate-900" />,
    },
    {
      title: "Itinerari Su Misura",
      description: "Pianifica il tuo viaggio ideale tra baie nascoste e approdi incontaminati.",
      icon: <Compass strokeWidth={1.5} className="h-10 w-10 text-slate-900" />,
    },
    {
      title: "Cambusa Esclusiva",
      description: "Selezioni di vini, champagne e prodotti tipici sardi, direttamente a bordo.",
      icon: <ShoppingBag strokeWidth={1.5} className="h-10 w-10 text-slate-900" />,
    },
    {
      title: "Servizi Concierge",
      description: "Yacht detailing, assistenza tecnica e transfer VIP curati nei minimi dettagli.",
      icon: <Sparkles strokeWidth={1.5} className="h-10 w-10 text-slate-900" />,
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">L'Eccellenza in Mare</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
            MARINAGO è il tuo concierge digitale per vivere la navigazione in Sardegna senza compromessi.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <div key={index} className="flex flex-col items-center text-center p-10 rounded-2xl border border-slate-100 hover:shadow-2xl transition-all duration-300 bg-slate-50 group cursor-pointer hover:-translate-y-1">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm transition-transform duration-300 group-hover:scale-110">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 tracking-wide">{pillar.title}</h3>
              <p className="text-slate-500 leading-relaxed font-light">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
