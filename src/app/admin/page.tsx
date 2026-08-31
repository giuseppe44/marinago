import { createClient } from "@/lib/supabase/server";
import { TrendingUp, Users, Anchor, CheckCircle } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  // Statistiche demo per Superadmin
  const stats = [
    { label: "Porti Affiliati", value: "24", icon: <Anchor className="h-6 w-6 text-blue-600" />, trend: "+2", bg: "bg-blue-50" },
    { label: "Utenti Attivi", value: "1,430", icon: <Users className="h-6 w-6 text-purple-600" />, trend: "+12%", bg: "bg-purple-50" },
    { label: "Prenotazioni Mese", value: "856", icon: <CheckCircle className="h-6 w-6 text-emerald-600" />, trend: "+5%", bg: "bg-emerald-50" },
    { label: "Volume Transato", value: "€ 42.500", icon: <TrendingUp className="h-6 w-6 text-amber-600" />, trend: "+18%", bg: "bg-amber-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1">Stato generale della piattaforma MARINAGO</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Seleziona un modulo operativo</h3>
        <p className="text-slate-500 mb-6">Usa il menu laterale per accedere direttamente ai moduli Gestore (Porti) o Fornitore (Cambusa).</p>
      </div>
    </div>
  );
}