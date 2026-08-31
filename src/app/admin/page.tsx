import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Users, Anchor, CheckCircle, CalendarDays, Ship } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  // Statistiche dinamiche
  const { count: marinasCount } = await supabase.from("marinas").select("*", { count: "exact", head: true });
  const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true });
  const { count: bookingsCount } = await supabase.from("bookings").select("*", { count: "exact", head: true });

  // Ultime prenotazioni REALI dal database
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      check_in,
      check_out,
      status,
      total_price,
      created_at,
      marinas (name),
      users (full_name, email),
      boats (name, length)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  const stats = [
    { label: "Porti Affiliati", value: marinasCount || 0, icon: <Anchor className="h-6 w-6 text-blue-600" />, bg: "bg-blue-50" },
    { label: "Utenti Registrati", value: usersCount || 0, icon: <Users className="h-6 w-6 text-purple-600" />, bg: "bg-purple-50" },
    { label: "Prenotazioni Totali", value: bookingsCount || 0, icon: <CheckCircle className="h-6 w-6 text-emerald-600" />, bg: "bg-emerald-50" },
    { label: "Sistema Pagamenti", value: "Test", icon: <TrendingUp className="h-6 w-6 text-amber-600" />, bg: "bg-amber-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Superadmin Dashboard</h1>
          <p className="text-slate-500 mt-1">Controllo totale della piattaforma MARINAGO</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-800">Tutte le Prenotazioni in Piattaforma</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Data Inserimento</th>
                <th className="px-6 py-4">Porto</th>
                <th className="px-6 py-4">Cliente & Barca</th>
                <th className="px-6 py-4">Periodo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Prezzo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString("it-IT", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {b.marinas?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{b.users?.full_name || "Ospite"}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Ship className="h-3 w-3" /> {b.boats?.name} ({b.boats?.length}m)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(b.check_in).toLocaleDateString("it-IT")} - {new Date(b.check_out).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      € {b.total_price}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nessuna prenotazione trovata nel database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}