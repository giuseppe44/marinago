-- ==========================================
-- SCRIPT DI SEED DEMO MARINAGO
-- Esegui questo script nell'SQL Editor di Supabase.
-- ==========================================

-- 1. Pulisce eventuali dati DEMO precedenti
DELETE FROM public.marinas WHERE name LIKE '[DEMO]%';
DELETE FROM public.vendors WHERE name LIKE '[DEMO]%';

-- 2. Inserimento Porti DEMO (restituisce gli ID per usarli dopo)
WITH inserted_marinas AS (
  INSERT INTO public.marinas (name, latitude, longitude, city, is_verified, booking_mode, amenities)
  VALUES 
    ('[DEMO] Marina di Porto Cervo', 41.1396, 9.5350, 'Arzachena', true, 'LIVE', '["WIFI", "ACQUA", "ELETTRICITA", "DOCCE"]'::jsonb),
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
    ('[DEMO] Macelleria Sarda', 'MEAT', 'Arzachena', true)
  RETURNING id, name
),
-- 6. Mappatura Fornitori ai Porti DEMO (Marina Vendors)
inserted_marina_vendors AS (
  INSERT INTO public.marina_vendors (marina_id, vendor_id, delivery_fee, min_order_amount, lead_time_hours)
  SELECT 
    m.id, v.id, 
    CASE WHEN v.name = '[DEMO] Enoteca del Porto' THEN 0 ELSE 15.00 END, -- 0€ enoteca, 15€ macelleria
    CASE WHEN v.name = '[DEMO] Enoteca del Porto' THEN 50 ELSE 100 END,  -- minimo d'ordine
    24
  FROM inserted_marinas m
  CROSS JOIN inserted_vendors v
  WHERE m.name = '[DEMO] Marina di Porto Cervo' -- Consegnano solo a Porto Cervo per test!
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
    ('[DEMO] Macelleria Sarda', 'Salsiccia Sarda', 'Fresco', 14.50, 'kg')
) as p(vendor_name, name, category, price, unit) ON p.vendor_name = v.name;
