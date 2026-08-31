import { ShoppingBag, Sparkles, Wrench, Car, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default function ServiziPage() {
  const servizi = [
    {
      title: "Cambusa Esclusiva",
      desc: "Selezioni di vini pregiati e prodotti freschi locali, consegnati direttamente a bordo.",
      icon: <ShoppingBag strokeWidth={1.5} className="h-10 w-10 text-slate-900" />,
    },
    {
      title: "Yacht Detailing",
      desc: "Servizi di pulizia approfondita e sanificazione professionale per interni ed esterni.",
      icon: <Sparkles strokeWidth={1.5} className="h-10 w-10 text-slate-900" />,
    },
    {
      title: "Assistenza Premium",
      desc: "Meccanici ed elettricisti certificati disponibili h24 nei porti affiliati.",
      icon: <Wrench strokeWidth={1.5} className="h-10 w-10 text-slate-900" />,
    },
    {
      title: "Transfer VIP",
      desc: "Spostamenti da e per aeroporti con auto NCC di lusso e autista privato.",
      icon: <Car strokeWidth={1.5} className="h-10 w-10 text-slate-900" />,
    },
    {
      title: "Chef a Bordo",
      desc: "Esperienze culinarie su misura con chef privati per le tue cene in rada.",
      icon: <UtensilsCrossed strokeWidth={1.5} className="h-10 w-10 text-slate-900" />,
    }
  ];

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Servizi Dedicati</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
            L'eccellenza del servizio concierge in Sardegna. Seleziona ciò di cui hai bisogno, ci occuperemo noi di ogni dettaglio all'ormeggio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {servizi.map((srv, idx) => (
            <Link key={idx} href="/cambusa" className="flex flex-col items-center text-center bg-slate-50 rounded-2xl border border-slate-100 p-10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {srv.icon}
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">{srv.title}</h3>
              <p className="text-slate-500 mb-8 font-light leading-relaxed">{srv.desc}</p>
              
              <span className="inline-block text-slate-900 font-medium tracking-wide uppercase text-sm group-hover:underline mt-auto">
                Prenota ora
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
