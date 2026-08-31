import { ShoppingBasket, Sparkles, Wrench, Car, Utensils } from "lucide-react";
import Link from "next/link";

export default function ServiziPage() {
  const servizi = [
    {
      title: "Cambusa Fresca",
      desc: "Ricevi la spesa direttamente a bordo prima della partenza.",
      icon: <ShoppingBasket className="h-10 w-10 text-emerald-600" />,
      color: "bg-emerald-50",
    },
    {
      title: "Pulizia Interni",
      desc: "Servizio di pulizia e sanificazione professionale per la tua barca.",
      icon: <Sparkles className="h-10 w-10 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      title: "Assistenza Tecnica",
      desc: "Interventi rapidi da meccanici ed elettricisti certificati nei porti.",
      icon: <Wrench className="h-10 w-10 text-orange-600" />,
      color: "bg-orange-50",
    },
    {
      title: "Transfer Privati",
      desc: "Spostamenti da e per aeroporti o hotel con auto NCC di lusso.",
      icon: <Car className="h-10 w-10 text-purple-600" />,
      color: "bg-purple-50",
    },
    {
      title: "Catering & Chef",
      desc: "Chef a bordo e catering esclusivo per le tue cene in rada.",
      icon: <Utensils className="h-10 w-10 text-rose-600" />,
      color: "bg-rose-50",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Servizi per la tua Barca</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Il tuo concierge digitale in Sardegna. Seleziona il servizio di cui hai bisogno e te lo portiamo direttamente all'ormeggio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {servizi.map((srv, idx) => (
            <Link key={idx} href="/cambusa" className="block bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all group">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${srv.color}`}>
                {srv.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{srv.title}</h3>
              <p className="text-slate-600 mb-6">{srv.desc}</p>
              
              <span className="inline-block text-blue-600 font-semibold group-hover:underline">
                Prenota ora &rarr;
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
