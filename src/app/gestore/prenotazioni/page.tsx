import { createClient } from "@/lib/supabase/server";
import { BookingsTable } from "@/components/gestore/BookingsTable";
import { CalendarDays } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function GestorePrenotazioniPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let { data: staffRecord } = await supabase
    .from("marina_staff")
    .select("marina_id")
    .eq("user_id", user?.id)
    .single();

  if (!staffRecord) {
    const { data: demoMarina } = await supabase.from("marinas").select("id").ilike("name", "%Cervo%").limit(1).single();
    if (demoMarina) {
      staffRecord = { marina_id: demoMarina.id } as any;
    } else {
      return null;
    }
  }

  if (!staffRecord) return null; // Type guard

  const { data: bookings } = await supabase
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
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-blue-600" />
            Registro Prenotazioni
          </h2>
          <p className="text-slate-500 mt-1">Gestisci le richieste di ormeggio e visualizza lo storico.</p>
        </div>
      </div>

      <BookingsTable initialBookings={bookings || []} />
    </div>
  );
}
