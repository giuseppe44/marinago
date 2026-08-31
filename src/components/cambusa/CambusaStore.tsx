"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingCart, Info, CheckCircle2 } from "lucide-react";
import { placeCambusaOrder } from "@/app/cambusa/actions";
import { useRouter } from "next/navigation";

export function CambusaStore({ booking, vendorsRules, products }: { booking: any, vendorsRules: any[], products: any[] }) {
  // cart = { productId: quantity }
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = (productId: string) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const handleRemove = (productId: string) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  // Raggruppa i prodotti nel carrello per Fornitore
  const cartItems = Object.entries(cart).map(([pId, qty]) => {
    const p = products.find(p => p.id === pId);
    return { ...p, quantity: qty };
  });

  const cartByVendor = vendorsRules.map(vr => {
    const vendorProductsInCart = cartItems.filter(item => item.vendor_id === vr.vendors.id);
    const subtotale = vendorProductsInCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const meetsMinOrder = subtotale >= vr.min_order_amount;
    
    return {
      vendor: vr.vendors,
      rule: vr,
      items: vendorProductsInCart,
      subtotale,
      meetsMinOrder,
      total: subtotale > 0 ? subtotale + vr.delivery_fee : 0
    };
  }).filter(v => v.items.length > 0);

  const grandTotal = cartByVendor.reduce((acc, v) => acc + v.total, 0);
  const canCheckout = cartByVendor.length > 0 && cartByVendor.every(v => v.meetsMinOrder);

  const handleCheckout = async () => {
    if (!canCheckout) return;
    setLoading(true);
    try {
      // Passiamo il carrello raggruppato alla Server Action per creare ordini separati
      const result = await placeCambusaOrder(booking.id, booking.marinas.id, cartByVendor);
      if (result.success) {
        alert("Ordine inoltrato con successo! I fornitori riceveranno le distinte separate.");
        setCart({});
        router.push("/profilo/prenotazioni");
      }
    } catch (err: any) {
      alert("Errore durante l'ordine: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Catalogo Prodotti */}
      <div className="flex-1">
        {vendorsRules.map(vr => {
          const vendorProducts = products.filter(p => p.vendor_id === vr.vendors.id);
          if (vendorProducts.length === 0) return null;

          return (
            <div key={vr.vendors.id} className="mb-12">
              <div className="mb-6 flex items-baseline justify-between border-b border-slate-200 pb-2">
                <h2 className="text-2xl font-bold text-slate-800">{vr.vendors.name}</h2>
                <div className="text-sm flex gap-4 text-slate-500">
                  <span>Consegna: {vr.delivery_fee === 0 ? "Gratis" : `€${vr.delivery_fee}`}</span>
                  <span>Minimo: €{vr.min_order_amount}</span>
                  <span>Preavviso: {vr.lead_time_hours}h</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {vendorProducts.map(product => {
                  const qty = cart[product.id] || 0;
                  return (
                    <div key={product.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="text-xs text-emerald-600 font-semibold uppercase mb-1">{product.category}</div>
                        <h3 className="font-bold text-slate-900 mb-1 leading-tight">{product.name}</h3>
                        <div className="text-2xl font-bold text-slate-800 mb-4">€{product.price} <span className="text-sm font-normal text-slate-500">/{product.unit_of_measure}</span></div>
                      </div>
                      
                      {qty === 0 ? (
                        <button 
                          onClick={() => handleAdd(product.id)}
                          className="w-full py-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" /> Aggiungi
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-1 border border-emerald-100">
                          <button onClick={() => handleRemove(product.id)} className="w-10 h-10 flex items-center justify-center bg-white rounded shadow-sm text-emerald-700 hover:bg-emerald-100"><Minus className="h-4 w-4"/></button>
                          <span className="font-bold text-emerald-900">{qty} in carrello</span>
                          <button onClick={() => handleAdd(product.id)} className="w-10 h-10 flex items-center justify-center bg-white rounded shadow-sm text-emerald-700 hover:bg-emerald-100"><Plus className="h-4 w-4"/></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Carrello Multi-Vendor Sidebar */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 sticky top-24">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" /> Il tuo Ordine
          </h2>

          {cartByVendor.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Il carrello è vuoto.</p>
          ) : (
            <div className="space-y-6">
              {cartByVendor.map(v => (
                <div key={v.vendor.id} className="border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">{v.vendor.name}</h3>
                  
                  <div className="space-y-2 mb-3">
                    {v.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-600 truncate pr-2">{item.quantity}x {item.name}</span>
                        <span className="font-medium text-slate-800">€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Subtotale</span>
                      <span>€{v.subtotale.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consegna a Bordo</span>
                      <span>{v.rule.delivery_fee === 0 ? "Gratis" : `€${v.rule.delivery_fee.toFixed(2)}`}</span>
                    </div>
                  </div>

                  {!v.meetsMinOrder && (
                    <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded flex items-start gap-1">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      Mancano €{(v.rule.min_order_amount - v.subtotale).toFixed(2)} per raggiungere l'ordine minimo di {v.vendor.name}.
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-2">
                <div className="flex justify-between items-end mb-6">
                  <span className="font-bold text-slate-800 text-lg">Totale Cambusa</span>
                  <span className="text-3xl font-bold text-emerald-600">€{grandTotal.toFixed(2)}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={!canCheckout || loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" /> 
                  {loading ? "Elaborazione..." : "Conferma Ordini (Simulato)"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
