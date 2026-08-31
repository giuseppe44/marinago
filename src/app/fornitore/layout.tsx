import { createClient } from "@/lib/supabase/server";
import { Store, Package, Map, ShoppingBag, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FornitoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verifica che l'utente sia manager di un vendor
  const { data: vendorRecord } = await supabase
    .from("vendors")
    .select("id, name, vendor_type, is_verified")
    .eq("manager_id", user.id)
    .single();

  const vendorName = vendorRecord?.name || "Profilo non configurato";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Fornitore */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MARINAGO</span>
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Azienda Partner</div>
          <h2 className="text-sm font-bold text-white truncate" title={vendorName}>{vendorName}</h2>
          
          {vendorRecord && !vendorRecord.is_verified && (
             <div className="mt-2 text-xs bg-orange-900/30 text-orange-400 p-2 rounded border border-orange-800/50">
               Profilo in attesa di verifica
             </div>
          )}
          {!vendorRecord && (
            <p className="text-xs text-red-400 mt-2">Account non associato a un'azienda.</p>
          )}
        </div>
        
        <nav className="flex-1 py-4 space-y-1">
          <Link href="/fornitore" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
            <Store className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/fornitore/prodotti" className="flex items-center gap-3 px-6 py-3 text-emerald-400 bg-emerald-900/20 border-r-2 border-emerald-500 transition-colors">
            <Package className="h-4 w-4" /> Catalogo Prodotti
          </Link>
          <Link href="/fornitore/zone" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
            <Map className="h-4 w-4" /> Porti & Consegne
          </Link>
          <Link href="/fornitore/ordini" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
            <ShoppingBag className="h-4 w-4" /> Ordini a Bordo
          </Link>
          <Link href="/fornitore/impostazioni" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings className="h-4 w-4" /> Impostazioni
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <LogOut className="h-4 w-4" /> Esci
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">Area Fornitori</h1>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
             {user.email}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {vendorRecord ? children : (
            <div className="p-8 text-center bg-white rounded-xl border border-red-200 text-red-600 max-w-md mx-auto mt-10 shadow-sm">
              <h2 className="text-lg font-bold mb-2">Accesso Negato</h2>
              <p>Il tuo utente non è associato a nessuna Azienda Partner. Completa la registrazione come Fornitore.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
