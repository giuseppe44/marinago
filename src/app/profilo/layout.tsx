import { createClient } from "@/lib/supabase/server";
import { Ship, Calendar, User, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfiloLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800">Il mio account</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/profilo/barche" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg">
            <Ship className="h-5 w-5" /> Le mie barche
          </Link>
          <Link href="/profilo/prenotazioni" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-colors">
            <Calendar className="h-5 w-5" /> Prenotazioni
          </Link>
          <Link href="/profilo" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-colors">
            <User className="h-5 w-5" /> Dati personali
          </Link>
        </nav>

        <form action="/auth/signout" method="post" className="mt-8">
          <button className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors w-full">
            <LogOut className="h-5 w-5" /> Esci
          </button>
        </form>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-12">
        {children}
      </main>
    </div>
  );
}
