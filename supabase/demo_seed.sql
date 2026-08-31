-- ==========================================
-- SCRIPT DI SEED DEMO MARINAGO
-- Esegui questo script nell'SQL Editor di Supabase.
-- ==========================================

-- 1. Pulisce eventuali dati DEMO precedenti
DELETE FROM public.marinas WHERE name LIKE '[DEMO]%';
DELETE FROM public.vendors WHERE name LIKE '[DEMO]%';
DELETE FROM public.boats WHERE name LIKE '[DEMO]%';

-- 2. Inserimento Porti DEMO (restituisce gli ID per usarli dopo)
WITH inserted_marinas AS (
  INSERT INTO public.marinas (name, latitude, longitude, city, is_verified, booking_mode, amenities)
  VALUES 
    ('[DEMO] Marina di Porto Cervo', 41.1396, 9.5350, 'Arzachena', true, 'LIVE', '["WIFI", "ACQUA", "ELETTRICITA", "DOCCE", "CARBURANTE"]'::jsonb),
    ('[DEMO] Marina di Cagliari', 39.2115, 9.1129, 'Cagliari', true, 'LIVE', '["WIFI", "ACQUA", "ELETTRICITA", "RISTORANTI", "NEGOZI"]'::jsonb),
    ('[DEMO] Marina di Villasimius', 39.1177, 9.5085, 'Villasimius', true, 'LIVE', '["WIFI", "ACQUA", "ELETTRICITA", "CARBURANTE"]'::jsonb)
  RETURNING id, name
),
-- 3. Inserimento Pontili (uno per ogni porto)
inserted_piers AS (
  INSERT INTO public.piers (marina_id, name, description)
  SELECT id, 'Pontile A - Principale', 'Pontile principale per il transito'
  FROM inserted_marinas
  RETURNING id, marina_id
),
-- 4. Inserimento Ormeggi (Berths)
inserted_berths AS (
  INSERT INTO public.berths (marina_id, pier_id, code, max_length, max_width, max_draft, base_price, status)
  SELECT 
    m.id, p.id,
    'A-' || num_posto,
    CASE 
      WHEN num_posto <= 3 THEN 10.00
      WHEN num_posto <= 7 THEN 15.00
      WHEN num_posto <= 9 THEN 24.00
      ELSE 40.00
    END as max_length,
    CASE 
      WHEN num_posto <= 3 THEN 3.50
      WHEN num_posto <= 7 THEN 4.50
      WHEN num_posto <= 9 THEN 6.00
      ELSE 9.00
    END as max_width,
    CASE 
      WHEN num_posto <= 3 THEN 2.00
      WHEN num_posto <= 7 THEN 2.50
      WHEN num_posto <= 9 THEN 3.50
      ELSE 5.00
    END as max_draft,
    CASE 
      WHEN num_posto <= 3 THEN 50.00
      WHEN num_posto <= 7 THEN 120.00
      WHEN num_posto <= 9 THEN 300.00
      ELSE 800.00
    END as base_price,
    'AVAILABLE'::berth_status
  FROM inserted_marinas m
  JOIN inserted_piers p ON p.marina_id = m.id
  CROSS JOIN generate_series(1, 10) as num_posto
),
-- 5. Inserimento Fornitori Cambusa DEMO
inserted_vendors AS (
  INSERT INTO public.vendors (name, vendor_type, city, is_verified)
  VALUES 
    ('[DEMO] Enoteca del Porto', 'WINE', 'Arzachena', true),
    ('[DEMO] Macelleria Sarda', 'MEAT', 'Arzachena', true),
    ('[DEMO] Pulizie a Bordo Cagliari', 'SERVICES', 'Cagliari', true)
  RETURNING id, name, city
),
-- 6. Mappatura Fornitori ai Porti DEMO (Marina Vendors)
inserted_marina_vendors AS (
  INSERT INTO public.marina_vendors (marina_id, vendor_id, delivery_fee, min_order_amount, lead_time_hours)
  SELECT 
    m.id, v.id, 
    CASE WHEN v.name = '[DEMO] Enoteca del Porto' THEN 0 ELSE 15.00 END,
    CASE WHEN v.name = '[DEMO] Enoteca del Porto' THEN 50 ELSE 100 END,
    24
  FROM inserted_marinas m
  CROSS JOIN inserted_vendors v
  WHERE (m.name = '[DEMO] Marina di Porto Cervo' AND v.city = 'Arzachena')
     OR (m.name = '[DEMO] Marina di Cagliari' AND v.city = 'Cagliari')
)
-- 7. Inserimento Prodotti DEMO
INSERT INTO public.products (vendor_id, name, category, price, unit_of_measure, is_active)
SELECT 
  v.id, 
  p.name, p.category, p.price, p.unit, true
FROM inserted_vendors v
JOIN (
  VALUES 
    ('[DEMO] Enoteca del Porto', 'Vermentino di Gallura DOCG', 'Bevande', 18.50, 'bottiglia'),
    ('[DEMO] Enoteca del Porto', 'Cannonau Riserva', 'Bevande', 22.00, 'bottiglia'),
    ('[DEMO] Enoteca del Porto', 'Ghiaccio a cubetti', 'Generico', 4.00, 'confezione'),
    ('[DEMO] Macelleria Sarda', 'Costata di Manzo (Premium)', 'Fresco', 35.00, 'kg'),
    ('[DEMO] Macelleria Sarda', 'Salsiccia Sarda', 'Fresco', 14.50, 'kg'),
    ('[DEMO] Pulizie a Bordo Cagliari', 'Pulizia Completa Interni', 'Servizi', 150.00, 'servizio')
) as p(vendor_name, name, category, price, unit) ON p.vendor_name = v.name;

-- 8. Inserimento Barche DEMO (Per popolare la home a visitatori non loggati)
INSERT INTO public.boats (name, boat_type, length, width, draft, passengers_capacity)
VALUES 
  ('[DEMO] Gommone Sole', 'Gommone', 7.50, 2.50, 0.80, 6),
  ('[DEMO] Barca a Vela Vento', 'Vela', 12.00, 3.80, 2.10, 8),
  ('[DEMO] Catamarano Spazio', 'Catamarano', 14.50, 7.50, 1.30, 10),
  ('[DEMO] Motoryacht Veloce', 'Motore', 18.00, 4.80, 1.50, 12),
  ('[DEMO] Superyacht Lusso', 'Motore', 24.00, 6.00, 2.00, 14);

-- 9. Creazione Policy RLS per permettere ai visitatori NON loggati di leggere le barche DEMO
DROP POLICY IF EXISTS "Lettura pubblica per DEMO boats" ON public.boats;
CREATE POLICY "Lettura pubblica per DEMO boats" ON public.boats FOR SELECT USING (name LIKE '[DEMO]%');
