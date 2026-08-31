import Link from "next/link";
import { Ship, ShoppingBasket, Map, Menu, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Ship className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-slate-900 tracking-tight">MARINAGO</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/ormeggi" className="hover:text-blue-600 transition-colors">Porti & Ormeggi</Link>
          <Link href="/itinerari" className="hover:text-blue-600 transition-colors">Itinerari</Link>
          <Link href="/cambusa" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <ShoppingBasket className="h-4 w-4" /> Cambusa
          </Link>
          <Link href="/servizi" className="hover:text-blue-600 transition-colors">Servizi</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/profilo/barche" className="hidden md:flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
              <User className="h-4 w-4" /> Il mio Profilo
            </Link>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              <User className="h-4 w-4" /> Accedi
            </Link>
          )}
          <button className="md:hidden p-2 text-slate-600">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
