import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/fornitore/ProductGrid";
import { redirect } from "next/navigation";

export default async function FornitoreProdottiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Recupera l'ID del vendor
  const { data: vendorRecord } = await supabase
    .from("vendors")
    .select("id")
    .eq("manager_id", user.id)
    .single();

  if (!vendorRecord) return null; // Gestito dal layout

  // Recupera i prodotti
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendorRecord.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Catalogo Prodotti</h2>
          <p className="text-slate-500 text-sm">Gestisci l'inventario dei prodotti offerti per la consegna a bordo.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <ProductGrid initialProducts={products || []} vendorId={vendorRecord.id} />
      </div>
    </div>
  );
}
