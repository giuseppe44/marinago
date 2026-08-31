import { CheckCircle2, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ booking: string }> }) {
  const { booking } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("check_in, check_out, marinas(name, city)")
    .eq("id", booking)
    .single();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Prenotazione Confermata!</h1>
        <p className="text-slate-500 mb-8">Il tuo ormeggio è stato bloccato con successo.</p>

        {data && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left mb-8 space-y-3 text-sm">
             <div className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-2">
               {(data.marinas as any).name} ({(data.marinas as any).city})
             </div>
             <div className="flex justify-between">
               <span className="text-slate-500">Check-in:</span>
               <span className="font-semibold text-slate-700">{data.check_in}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-slate-500">Check-out:</span>
               <span className="font-semibold text-slate-700">{data.check_out}</span>
             </div>
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/profilo/prenotazioni" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
            Le mie Prenotazioni
          </Link>
          <Link href="/" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition-colors">
            Torna alla Home
          </Link>
        </div>
      </div>
    </div>
  );
}
