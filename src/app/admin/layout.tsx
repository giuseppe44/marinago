import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Users, Ship, Anchor, Settings, LogOut, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col text-white">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight">SUPERADMIN</h2>
          <p className="text-sm text-slate-400">Pannello di controllo</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-slate-800 text-white font-medium rounded-lg">
            <LayoutDashboard className="h-5 w-5 text-emerald-400" /> Overview
          </Link>
          <Link href="/gestore" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white font-medium rounded-lg transition-colors">
            <Anchor className="h-5 w-5 text-blue-400" /> Gestione Porti
          </Link>
          <Link href="/fornitore" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white font-medium rounded-lg transition-colors">
            <ShoppingBag className="h-5 w-5 text-amber-400" /> Cambusa & Servizi
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white font-medium rounded-lg transition-colors">
            <Users className="h-5 w-5 text-purple-400" /> Utenti & CRM
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white font-medium rounded-lg transition-colors">
            <Ship className="h-5 w-5 text-rose-400" /> Flotta Barche
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white font-medium rounded-lg transition-colors">
            <Settings className="h-5 w-5 text-slate-400" /> Impostazioni
          </Link>
        </nav>

        <form action="/auth/signout" method="post" className="mt-8">
          <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-950 font-medium rounded-lg transition-colors w-full">
            <LogOut className="h-5 w-5" /> Esci
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}