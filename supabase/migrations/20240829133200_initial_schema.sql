-- MARINAGO - Schema V2 (Include Marketplace Cambusa)

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'MARINA_MANAGER', 'VENDOR', 'BOATER', 'VISITOR');
CREATE TYPE booking_status AS ENUM ('PAYMENT_PENDING', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE berth_status AS ENUM ('AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE', 'OCCUPIED');
CREATE TYPE pricing_model AS ENUM ('FLAT', 'PER_DAY', 'PER_METER_PER_DAY', 'PER_PERSON');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'PREPARING', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- 2. USERS (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'VISITOR',
  full_name TEXT NOT NULL,
  phone TEXT,
  preferred_language VARCHAR(2) DEFAULT 'it',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MARINAS (Porti)
CREATE TABLE public.marinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description_translations JSONB DEFAULT '{}'::jsonb,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  city TEXT,
  external_system_provider TEXT, 
  external_system_id TEXT,
  currency VARCHAR(3) DEFAULT 'EUR',
  is_verified BOOLEAN DEFAULT FALSE,
  booking_mode VARCHAR(20) DEFAULT 'LIVE',
  amenities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MARINA STAFF (Permessi granulari gestori)
CREATE TABLE public.marina_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  staff_role VARCHAR(50) DEFAULT 'MANAGER',
  UNIQUE(marina_id, user_id)
);

-- 5. PIERS (Pontili/Aree)
CREATE TABLE public.piers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  map_coordinates JSONB 
);

-- 6. BERTHS (Ormeggi)
CREATE TABLE public.berths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  pier_id UUID REFERENCES public.piers(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  max_length DECIMAL(6, 2) NOT NULL,
  max_width DECIMAL(6, 2) NOT NULL,
  max_draft DECIMAL(6, 2) NOT NULL,
  berth_type VARCHAR(50) DEFAULT 'PONTOON',
  status berth_status DEFAULT 'AVAILABLE',
  base_price DECIMAL(10, 2) NOT NULL,
  external_id TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BOATS (Imbarcazioni)
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
  flag VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BOOKINGS (Prenotazioni Ormeggio)
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
  services_price DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  platform_commission_rate DECIMAL(5, 2) DEFAULT 0,
  platform_commission_amount DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- MARKETPLACE CAMBUSA E SERVIZI (NUOVO)
-- ==========================================

-- 9. VENDORS (Fornitori Marketplace)
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  vendor_type VARCHAR(50), 
  address TEXT,
  city TEXT,
  contact_info JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PRODUCTS (Prodotti della Cambusa e Servizi Generici)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT -1,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MARINA_VENDORS (Incrocio consegne)
CREATE TABLE public.marina_vendors (
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  PRIMARY KEY (marina_id, vendor_id)
);

-- 12. ORDERS (Ordini Cambusa / Marketplace)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boater_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL, 
  marina_id UUID REFERENCES public.marinas(id) ON DELETE SET NULL,   
  status order_status DEFAULT 'PENDING',
  delivery_date TIMESTAMPTZ, 
  delivery_notes TEXT,       
  products_total DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  platform_commission DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ORDER_ITEMS (Dettaglio Prodotti)
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

-- 14. SEASONAL_RATES (Disponibilità ormeggi)
CREATE TABLE public.availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  berth_id UUID REFERENCES public.berths(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  price_override DECIMAL(10, 2),
  is_last_minute BOOLEAN DEFAULT FALSE,
  reason TEXT
);

-- 15. REVIEWS (Recensioni verificate)
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  marina_id UUID REFERENCES public.marinas(id) ON DELETE CASCADE,
  rating_overall INT CHECK (rating_overall BETWEEN 1 AND 5),
  rating_facilities INT CHECK (rating_facilities BETWEEN 1 AND 5),
  rating_services INT CHECK (rating_services BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. ITINERARIES
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ITINERARY_STOPS
CREATE TABLE public.itinerary_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
  marina_id UUID REFERENCES public.marinas(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  arrival_date DATE,
  departure_date DATE,
  order_index INT NOT NULL
);
