import { Ship, MapPin, Mail, Phone } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Ship className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold text-white tracking-tight">MARINAGO</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6">
              Il tuo concierge digitale per vivere il mare della Sardegna senza pensieri. Prenotazioni, cambusa e servizi nautici.
            </p>
          </div>

          {/* Esplora */}
          <div>
            <h3 className="text-white font-semibold mb-4">Esplora</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ormeggi" className="hover:text-white transition-colors">Porti & Ormeggi</Link></li>
              <li><Link href="/itinerari" className="hover:text-white transition-colors">Itinerari Consigliati</Link></li>
              <li><Link href="/cambusa" className="hover:text-white transition-colors">Cambusa a Bordo</Link></li>
              <li><Link href="/servizi" className="hover:text-white transition-colors">Servizi Nautici</Link></li>
            </ul>
          </div>

          {/* Partner */}
          <div>
            <h3 className="text-white font-semibold mb-4">Per i Partner</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/gestore" className="hover:text-white transition-colors">Dashboard Marina</Link></li>
              <li><Link href="/fornitore" className="hover:text-white transition-colors">Dashboard Fornitore</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Diventa Partner</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API & Integrazioni</a></li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contatti</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-500 shrink-0" />
                <span>Via del Mare 1, 07021 Arzachena (SS), Sardegna</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-500 shrink-0" />
                <a href="mailto:info@marinago.it" className="hover:text-white transition-colors">info@marinago.it</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-500 shrink-0" />
                <span>+39 0789 123456</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-sm text-center text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} MARINAGO. Tutti i diritti riservati.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Termini di Servizio</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
