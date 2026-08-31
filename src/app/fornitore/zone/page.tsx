import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ZoneGrid } from "@/components/fornitore/ZoneGrid";

export default async function FornitoreZonePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Recupera l'ID del vendor
  const { data: vendorRecord } = await supabase
    .from("vendors")
    .select("id")
    .eq("manager_id", user.id)
    .single();

  if (!vendorRecord) return null;

  // Recupera la lista di TUTTI i porti disponibili sulla piattaforma (che sono verificati)
  const { data: allMarinas } = await supabase
    .from("marinas")
    .select("id, name, city")
    .eq("is_verified", true)
    .order("city");

  // Recupera le zone attualmente attive per questo fornitore
  const { data: activeZones } = await supabase
    .from("marina_vendors")
    .select("*")
    .eq("vendor_id", vendorRecord.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Porti Serviti & Costi di Consegna</h2>
          <p className="text-slate-500 text-sm">Decidi in quali porti vuoi consegnare, imposta ordine minimo e tempi di preavviso (Lead Time).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <ZoneGrid 
          vendorId={vendorRecord.id} 
          allMarinas={allMarinas || []} 
          activeZones={activeZones || []} 
        />
      </div>
    </div>
  );
}
