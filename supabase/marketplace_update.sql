-- ==========================================
-- AGGIORNAMENTO SCHEMA: MARKETPLACE CAMBUSA
-- ==========================================

-- 1. Estensione tabella Products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(20) DEFAULT 'pz', -- kg, bottiglia, pezzo
ADD COLUMN IF NOT EXISTS min_order_quantity INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb, -- varianti es. colore, dimensione
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 22.00; -- IVA di default

-- 2. Estensione tabella Marina_Vendors (Zone di Consegna)
ALTER TABLE public.marina_vendors 
ADD COLUMN IF NOT EXISTS min_order_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_schedule JSONB DEFAULT '{}'::jsonb, -- Giorni/orari disponibili
ADD COLUMN IF NOT EXISTS lead_time_hours INT DEFAULT 24, -- Tempi di preavviso
ADD COLUMN IF NOT EXISTS direct_to_berth_available BOOLEAN DEFAULT TRUE;

-- ==========================================
-- SICUREZZA RLS (ROW LEVEL SECURITY)
-- ==========================================

-- Abilita RLS sulle tabelle chiave
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marina_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 3. Policy VENDORS (I fornitori possono vedere il proprio profilo, il pubblico può vederli tutti)
CREATE POLICY "Tutti possono vedere i fornitori verificati" ON public.vendors FOR SELECT USING (is_verified = true);
CREATE POLICY "I fornitori vedono se stessi" ON public.vendors FOR SELECT USING (manager_id = auth.uid());
CREATE POLICY "I fornitori modificano il proprio profilo" ON public.vendors FOR UPDATE USING (manager_id = auth.uid());

-- 4. Policy PRODUCTS
CREATE POLICY "Tutti possono vedere i prodotti attivi" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Fornitori gestiscono i propri prodotti" ON public.products FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.manager_id = auth.uid())
);

-- 5. Policy MARINA_VENDORS (Mappatura consegne)
CREATE POLICY "Tutti leggono le zone di consegna" ON public.marina_vendors FOR SELECT USING (true);
CREATE POLICY "Fornitori gestiscono le proprie zone" ON public.marina_vendors FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = marina_vendors.vendor_id AND v.manager_id = auth.uid())
);

-- 6. Policy ORDERS (Diportista e Fornitore)
CREATE POLICY "Diportisti vedono propri ordini" ON public.orders FOR SELECT USING (boater_id = auth.uid());
CREATE POLICY "Diportisti creano ordini" ON public.orders FOR INSERT WITH CHECK (boater_id = auth.uid());
CREATE POLICY "Fornitori vedono ordini ricevuti" ON public.orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi 
    JOIN public.vendors v ON oi.vendor_id = v.id
    WHERE oi.order_id = orders.id AND v.manager_id = auth.uid()
  )
);
-- I fornitori possono aggiornare lo status degli ordini (es. 'PREPARING', 'DELIVERED')
CREATE POLICY "Fornitori aggiornano ordini" ON public.orders FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi 
    JOIN public.vendors v ON oi.vendor_id = v.id
    WHERE oi.order_id = orders.id AND v.manager_id = auth.uid()
  )
);

-- 7. Policy ORDER_ITEMS
CREATE POLICY "Diportisti vedono dettaglio ordini" ON public.order_items FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.boater_id = auth.uid())
);
CREATE POLICY "Fornitori vedono dettaglio ordini propri" ON public.order_items FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = order_items.vendor_id AND v.manager_id = auth.uid())
);
CREATE POLICY "Diportisti inseriscono items" ON public.order_items FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.boater_id = auth.uid())
);
