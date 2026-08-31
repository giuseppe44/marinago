import { createClient } from "@/lib/supabase/server";
import { Ship, Calendar, BookOpen, Settings, Home, LogOut, DownloadCloud } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function GestoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifica che l'utente sia un Marina Manager (o Admin)
  let { data: staffRecord } = await supabase
    .from("marina_staff")
    .select("marina_id, marinas(name)")
    .eq("user_id", user.id)
    .single();

  // AUTO-FIX PER DEMO: Se l'admin non ha un porto associato, glielo assegniamo noi forzatamente.
  if (!staffRecord) {
    const { data: demoMarina } = await supabase.from("marinas").select("id, name").ilike("name", "%Cervo%").limit(1).single();
    if (demoMarina) {
      // 1. Assicura che l'utente esista in public.users per non violare la foreign key
      await supabase.from("users").upsert({ id: user.id, full_name: user.email || 'Admin', role: 'MARINA_MANAGER' });
      // 2. Associa il porto
      await supabase.from("marina_staff").upsert({ marina_id: demoMarina.id, user_id: user.id });
      staffRecord = { marina_id: demoMarina.id, marinas: { name: demoMarina.name } } as any;
    }
  }

  const marinaName = (staffRecord?.marinas as any)?.name || "Nessuna Marina Associata";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Gestore */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Ship className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MARINAGO</span>
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Marina Attuale</div>
          <h2 className="text-sm font-bold text-white truncate" title={marinaName}>{marinaName}</h2>
          {!staffRecord && (
            <p className="text-xs text-red-400 mt-2">Account non configurato. Contatta l'amministratore.</p>
          )}
        </div>
        
        <nav className="flex-1 py-4 space-y-1">
          <Link href="/gestore" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
            <Home className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/gestore/ormeggi" className="flex items-center gap-3 px-6 py-3 text-blue-400 bg-blue-900/20 border-r-2 border-blue-500 transition-colors">
            <Ship className="h-4 w-4" /> Gestione Ormeggi
          </Link>
          <Link href="/gestore/calendario" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
            <Calendar className="h-4 w-4" /> Calendario & Disponibilità
          </Link>
          <Link href="/gestore/prenotazioni" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
            <BookOpen className="h-4 w-4" /> Prenotazioni
          </Link>
          <Link href="/gestore/api-sync" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
            <DownloadCloud className="h-4 w-4" /> Sincronizzazione API
          </Link>
          <Link href="/gestore/impostazioni" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings className="h-4 w-4" /> Impostazioni Porto
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
        {/* Topbar for mobile or quick actions */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">Gestione Infrastruttura</h1>
          <div className="flex items-center gap-4">
             <div className="text-sm font-medium text-slate-600">{user.email}</div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {staffRecord ? children : (
            <div className="p-8 text-center bg-white rounded-xl border border-red-200 text-red-600 max-w-md mx-auto mt-10 shadow-sm">
              <h2 className="text-lg font-bold mb-2">Accesso Negato</h2>
              <p>Il tuo utente non è associato a nessuna Marina. Chiedi all'amministratore di MARINAGO di assegnarti un porto.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
