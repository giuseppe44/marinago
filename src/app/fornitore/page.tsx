import { createClient } from "@/lib/supabase/server";
import { Store, Package, Map, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function FornitoreDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: vendorRecord } = await supabase
    .from("vendors")
    .select("*")
    .eq("manager_id", user?.id)
    .single();

  if (!vendorRecord) return null;

  // Statistiche veloci
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", vendorRecord.id);

  const { count: activeOrders } = await supabase
    .from("orders")
    .select(`id, order_items!inner(vendor_id)`, { count: "exact", head: true })
    .eq("order_items.vendor_id", vendorRecord.id)
    .in("status", ["PENDING", "PREPARING"]);

  const { count: portsServed } = await supabase
    .from("marina_vendors")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", vendorRecord.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Benvenuto, {vendorRecord.name}</h2>
        <p className="text-slate-500">La tua centrale operativa per la consegna a bordo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/fornitore/prodotti" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-emerald-300 transition-colors group cursor-pointer">
          <div className="bg-emerald-50 p-4 rounded-xl group-hover:bg-emerald-100 transition-colors"><Package className="h-6 w-6 text-emerald-600" /></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{productsCount || 0}</div>
            <div className="text-sm font-medium text-slate-500">Prodotti a Catalogo</div>
          </div>
        </Link>
        <Link href="/fornitore/zone" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition-colors group cursor-pointer">
          <div className="bg-blue-50 p-4 rounded-xl group-hover:bg-blue-100 transition-colors"><Map className="h-6 w-6 text-blue-600" /></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{portsServed || 0}</div>
            <div className="text-sm font-medium text-slate-500">Porti Serviti</div>
          </div>
        </Link>
        <Link href="/fornitore/ordini" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-orange-300 transition-colors group cursor-pointer">
          <div className="bg-orange-50 p-4 rounded-xl group-hover:bg-orange-100 transition-colors"><ShoppingBag className="h-6 w-6 text-orange-600" /></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeOrders || 0}</div>
            <div className="text-sm font-medium text-slate-500">Ordini da Preparare</div>
          </div>
        </Link>
      </div>

      <div className="mt-8 bg-emerald-50 p-8 rounded-2xl border border-emerald-100 shadow-sm">
        <h3 className="text-lg font-bold text-emerald-900 mb-2">Come funziona la consegna a bordo?</h3>
        <p className="text-emerald-800 text-sm mb-4 leading-relaxed max-w-3xl">
          I diportisti vedranno i tuoi prodotti solo se hanno prenotato un ormeggio in uno dei Porti che hai selezionato nella sezione <strong>Porti & Consegne</strong>.
          Quando ricevi un ordine, MARINAGO ti indicherà esattamente il nome della barca, il pontile e il numero del posto barca dove effettuare la consegna.
        </p>
      </div>
    </div>
  );
}
