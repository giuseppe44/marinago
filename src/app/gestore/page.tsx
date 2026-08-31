import { createClient } from "@/lib/supabase/server";
import { Ship, Anchor, BookOpen, AlertCircle, CalendarDays } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function GestoreDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let { data: staffRecord } = await supabase
    .from("marina_staff")
    .select("marina_id, marinas(name, city)")
    .eq("user_id", user?.id)
    .single();

  if (!staffRecord) {
    const { data: demoMarina } = await supabase.from("marinas").select("id, name, city").ilike("name", "%Cervo%").limit(1).single();
    if (demoMarina) {
      staffRecord = { marina_id: demoMarina.id, marinas: { name: demoMarina.name, city: demoMarina.city } } as any;
    } else {
      return null;
    }
  }

  if (!staffRecord) return null; // Type guard for TypeScript

  // Statistiche veloci
  const { count: berthsCount } = await supabase
    .from("berths")
    .select("*", { count: "exact", head: true })
    .eq("marina_id", staffRecord.marina_id);

  const { count: activeBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("marina_id", staffRecord.marina_id)
    .in("status", ["CONFIRMED", "IN_PROGRESS"]);

  // Prenotazioni specifiche per QUESTO porto
  const { data: marinaBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      check_in,
      check_out,
      status,
      total_price,
      created_at,
      users (full_name, email),
      boats (name, length)
    `)
    .eq("marina_id", staffRecord.marina_id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{(staffRecord.marinas as any).name}</h2>
        <p className="text-slate-500">{(staffRecord.marinas as any).city} - Gestione Operativa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-xl"><Anchor className="h-6 w-6 text-blue-600" /></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{berthsCount || 0}</div>
            <div className="text-sm font-medium text-slate-500">Ormeggi Totali</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl"><BookOpen className="h-6 w-6 text-emerald-600" /></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeBookings || 0}</div>
            <div className="text-sm font-medium text-slate-500">Prenotazioni Attive</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-4 rounded-xl"><AlertCircle className="h-6 w-6 text-orange-600" /></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <div className="text-sm font-medium text-slate-500">Richieste in Sospeso</div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-800">Ultime Prenotazioni Ricevute</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Data Ricezione</th>
                <th className="px-6 py-4">Cliente & Barca</th>
                <th className="px-6 py-4">Periodo Ormeggio</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Incasso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marinaBookings && marinaBookings.length > 0 ? (
                marinaBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString("it-IT", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Nessuna prenotazione trovata per il tuo porto.
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
