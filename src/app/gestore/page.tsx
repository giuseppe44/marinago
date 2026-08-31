import { createClient } from "@/lib/supabase/server";
import { Ship, Anchor, BookOpen, AlertCircle } from "lucide-react";

export default async function GestoreDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: staffRecord } = await supabase
    .from("marina_staff")
    .select("marina_id, marinas(name, city)")
    .eq("user_id", user?.id)
    .single();

  if (!staffRecord) return null;

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{(staffRecord.marinas as any).name}</h2>
        <p className="text-slate-500">{(staffRecord.marinas as any).city}</p>
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

      <div className="mt-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Prevenzione Overbooking (Requisito di Sicurezza)</h3>
        <p className="text-slate-600 text-sm mb-4">
          Come discusso, prima di abilitare i pagamenti in produzione, verrà applicato un vincolo fisico sul database PostgreSQL 
          utilizzando un <code>EXCLUDE CONSTRAINT</code>. Questo garantirà matematicamente a livello di database che due prenotazioni non 
          possano mai sovrapporsi sulle stesse date per lo stesso ormeggio, bypassando qualsiasi possibile race-condition software.
        </p>
        <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
          ALTER TABLE public.bookings<br/>
          ADD CONSTRAINT prevent_overlapping_bookings<br/>
          EXCLUDE USING GIST (<br/>
          &nbsp;&nbsp;berth_id WITH =,<br/>
          &nbsp;&nbsp;daterange(check_in, check_out, '()') WITH &amp;&amp;<br/>
          ) WHERE (status != 'CANCELLED');
        </div>
      </div>
    </div>
  );
}
