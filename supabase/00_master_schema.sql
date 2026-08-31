-- ==========================================
-- MARINAGO - MASTER SCHEMA
-- Questo script crea l'intero database da zero.
-- Include: Tabelle, Estensioni, RLS e Vincoli Fisici.
-- ==========================================

-- 0. ESTENSIONI
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist; -- Necessario per il vincolo di overbooking

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'MARINA_MANAGER', 'VENDOR', 'BOATER', 'VISITOR');
CREATE TYPE booking_status AS ENUM ('PAYMENT_PENDING', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE berth_status AS ENUM ('AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE', 'OCCUPIED');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'PREPARING', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- 2. UTENTI (Sincronizzati con auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'VISITOR',
  full_name TEXT NOT NULL,
  phone TEXT,
  preferred_language VARCHAR(2) DEFAULT 'it',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MARINE (Porti)
CREATE TABLE public.marinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  currency VARCHAR(3) DEFAULT 'EUR',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STAFF MARINE
CREATE TABLE public.marina_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  staff_role VARCHAR(50) DEFAULT 'MANAGER',
  UNIQUE(marina_id, user_id)
);

-- 5. PONTILI
CREATE TABLE public.piers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT
);

-- 6. ORMEGGI
CREATE TABLE public.berths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  pier_id UUID REFERENCES public.piers(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  max_length DECIMAL(6, 2) NOT NULL,
  max_width DECIMAL(6, 2) NOT NULL,
  max_draft DECIMAL(6, 2) NOT NULL,
  status berth_status DEFAULT 'AVAILABLE',
  base_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BARCHE (Diportisti)
CREATE TABLE public.boats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  boat_type VARCHAR(50),
  length DECIMAL(6, 2) NOT NULL,
  width DECIMAL(6, 2) NOT NULL,
  draft DECIMAL(6, 2) NOT NULL,
  height DECIMAL(6, 2), 
  passengers_capacity INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRENOTAZIONI (Bookings)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boater_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  berth_id UUID REFERENCES public.berths(id) ON DELETE SET NULL,
  boat_id UUID REFERENCES public.boats(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status booking_status DEFAULT 'PENDING',
  berth_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FORNITORI CAMBUSA (Vendors)
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  vendor_type VARCHAR(50), 
  city TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PRODOTTI CAMBUSA
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 22.00,
  unit_of_measure VARCHAR(20) DEFAULT 'pz',
  min_order_quantity INT DEFAULT 1,
  stock_quantity INT DEFAULT -1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ZONE DI CONSEGNA (Marina Vendors)
CREATE TABLE public.marina_vendors (
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  lead_time_hours INT DEFAULT 24,
  direct_to_berth_available BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (marina_id, vendor_id)
);

-- 12. ORDINI CAMBUSA
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boater_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  marina_id UUID REFERENCES public.marinas(id) ON DELETE SET NULL,
  status order_status DEFAULT 'PENDING',
  delivery_date TIMESTAMPTZ,
  products_total DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. DETTAGLIO ORDINI
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

-- ==========================================
-- VINCOLI FISICI (CONSTRAINT)
-- ==========================================

-- PREVENZIONE OVERBOOKING ASSOLUTA
ALTER TABLE public.bookings
ADD CONSTRAINT prevent_overlapping_bookings
EXCLUDE USING GIST (
  berth_id WITH =,
  daterange(check_in, check_out, '[)') WITH &&
) WHERE (status != 'CANCELLED');

-- ==========================================
-- SICUREZZA RLS (ROW LEVEL SECURITY)
-- ==========================================

ALTER TABLE public.marinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marina_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy Marinas, Piers, Berths (Tutti leggono, Gestori scrivono)
CREATE POLICY "Lettura pubblica" ON public.marinas FOR SELECT USING (true);
CREATE POLICY "Lettura pubblica" ON public.piers FOR SELECT USING (true);
CREATE POLICY "Lettura pubblica" ON public.berths FOR SELECT USING (true);

CREATE POLICY "Gestore insert ormeggi" ON public.berths FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.marina_staff ms WHERE ms.marina_id = berths.marina_id AND ms.user_id = auth.uid()));
CREATE POLICY "Gestore update ormeggi" ON public.berths FOR UPDATE USING (EXISTS (SELECT 1 FROM public.marina_staff ms WHERE ms.marina_id = berths.marina_id AND ms.user_id = auth.uid()));
CREATE POLICY "Gestore delete ormeggi" ON public.berths FOR DELETE USING (EXISTS (SELECT 1 FROM public.marina_staff ms WHERE ms.marina_id = berths.marina_id AND ms.user_id = auth.uid()));

-- Policy Boats (Proprietario legge e scrive)
CREATE POLICY "Utenti gestiscono proprie barche" ON public.boats FOR ALL USING (auth.uid() = owner_id);

-- Policy Bookings
CREATE POLICY "Utenti creano prenotazioni" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = boater_id);
CREATE POLICY "Utenti leggono proprie prenotazioni" ON public.bookings FOR SELECT USING (auth.uid() = boater_id);

-- Policy Marketplace
CREATE POLICY "Lettura fornitori" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Gestione fornitore" ON public.vendors FOR UPDATE USING (manager_id = auth.uid());
CREATE POLICY "Lettura prodotti" ON public.products FOR SELECT USING (true);
CREATE POLICY "Gestione prodotti" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = products.vendor_id AND v.manager_id = auth.uid()));
CREATE POLICY "Lettura zone" ON public.marina_vendors FOR SELECT USING (true);
CREATE POLICY "Gestione zone" ON public.marina_vendors FOR ALL USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = marina_vendors.vendor_id AND v.manager_id = auth.uid()));

-- Policy Orders
CREATE POLICY "Diportisti creano ordini" ON public.orders FOR INSERT WITH CHECK (boater_id = auth.uid());
CREATE POLICY "Diportisti leggono propri ordini" ON public.orders FOR SELECT USING (boater_id = auth.uid());
CREATE POLICY "Fornitori leggono ordini ricevuti" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.order_items oi JOIN public.vendors v ON oi.vendor_id = v.id WHERE oi.order_id = orders.id AND v.manager_id = auth.uid()));

CREATE POLICY "Diportisti vedono items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.boater_id = auth.uid()));
CREATE POLICY "Fornitori vedono items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = order_items.vendor_id AND v.manager_id = auth.uid()));
CREATE POLICY "Diportisti inseriscono items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.boater_id = auth.uid()));
