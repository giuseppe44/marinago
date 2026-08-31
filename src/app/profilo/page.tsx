import { createClient } from "@/lib/supabase/server";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default async function ProfiloPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Recupera i dati del profilo da public.users
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Dati Personali</h1>
      <p className="text-slate-500 mb-8 font-light">Gestisci le informazioni del tuo profilo e i contatti.</p>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{profile?.full_name || "Utente MARINAGO"}</h2>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Nome Completo</label>
              <input type="text" defaultValue={profile?.full_name || ""} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Email (Non modificabile)</label>
              <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Telefono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input type="tel" defaultValue={profile?.phone || ""} placeholder="+39 ..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Nazione</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input type="text" defaultValue="Italia" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="button" className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors uppercase tracking-wide text-sm">
              Salva Modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}