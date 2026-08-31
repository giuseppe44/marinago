import { createClient } from "@/lib/supabase/server";

export interface SearchParams {
  destination?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  boatId?: string;
  boatDims?: { length: number; width: number; draft: number };
}

export async function searchAvailableBerths(params: SearchParams) {
  const supabase = await createClient();
  const { destination, startDate, endDate, boatId, boatDims } = params;

  let boatLength = boatDims?.length || 0;
  let boatWidth = boatDims?.width || 0;
  let boatDraft = boatDims?.draft || 0;

  if (boatId) {
    const { data: boat, error: boatError } = await supabase
      .from("boats")
      .select("length, width, draft")
      .eq("id", boatId)
      .single();

    if (boatError) throw new Error("Barca non trovata o non autorizzata");
    
    boatLength = boat.length;
    boatWidth = boat.width;
    boatDraft = boat.draft;
  }

  // 2. Cerchiamo tutti gli ormeggi compatibili per dimensioni e destinazione
  // Usiamo una query complessa sfruttando il PostgREST di Supabase
  let query = supabase
    .from("berths")
    .select(`
      id, code, max_length, max_width, max_draft, base_price, status,
      marinas!inner (id, name, city, latitude, longitude, amenities),
      piers (name)
    `)
    // Filtri dimensioni (solo se abbiamo una barca)
    .gte("max_length", boatLength)
    .gte("max_width", boatWidth)
    .gte("max_draft", boatDraft)
    .eq("status", "AVAILABLE"); // Deve essere fisicamente operativo

  // Filtro destinazione (se inserita)
  if (destination) {
    // Cerchiamo sia nel nome del porto che nella città
    query = query.or(`name.ilike.%${destination}%,city.ilike.%${destination}%`, { referencedTable: 'marinas' });
  }

  const { data: compatibleBerths, error: searchError } = await query;
  if (searchError) throw searchError;
  if (!compatibleBerths || compatibleBerths.length === 0) return [];

  // 3. Verifica Disponibilità (Verifica Sovrapposizione Prenotazioni)
  // Troviamo tutte le prenotazioni attive che si sovrappongono alle date richieste
  const { data: overlappingBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("berth_id")
    .in("status", ["CONFIRMED", "IN_PROGRESS", "PAYMENT_PENDING", "PENDING"])
    .lt("check_in", endDate)
    .gt("check_out", startDate);

  if (bookingsError) throw bookingsError;

  // 4. Verifica Blocchi Manuali (availability_overrides)
  const { data: overrides, error: overridesError } = await supabase
    .from("availability_overrides")
    .select("berth_id, is_available")
    .lte("start_date", endDate)
    .gte("end_date", startDate)
    .eq("is_available", false);

  if (overridesError) throw overridesError;

  // Set di ID occupati
  const unavailableBerthIds = new Set([
    ...(overlappingBookings || []).map(b => b.berth_id),
    ...(overrides || []).map(o => o.berth_id)
  ]);

  // 5. Filtriamo e restituiamo solo gli ormeggi liberi
  const availableBerths = compatibleBerths.filter(
    (berth) => !unavailableBerthIds.has(berth.id)
  );

  return availableBerths;
}
