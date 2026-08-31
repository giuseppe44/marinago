import { searchAvailableBerths } from "@/lib/search/engine";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const results: any = {};
  
  const START_DATE = "2026-07-01";
  const END_DATE = "2026-07-04"; // 3 nights

  try {
    // 1. Caso Base: Barca piccola, nessuna prenotazione
    results.case1_smallBoat = await searchAvailableBerths({
      startDate: START_DATE,
      endDate: END_DATE,
      boatDims: { length: 8, width: 3, draft: 1.5 }
    });

    // 2. Caso Limite: Barca troppo lunga
    results.case2_tooLong = await searchAvailableBerths({
      startDate: START_DATE,
      endDate: END_DATE,
      boatDims: { length: 50, width: 3, draft: 1.5 } // Il massimo nel seed è 40m
    });

    // 3. Caso Limite: Barca pescaggio incompatibile
    results.case3_tooDeep = await searchAvailableBerths({
      startDate: START_DATE,
      endDate: END_DATE,
      boatDims: { length: 20, width: 5, draft: 6 } // Il massimo nel seed è 5m di pescaggio
    });

    // 4. Caso Destinazione Specifica
    results.case4_destination = await searchAvailableBerths({
      destination: "Cervo",
      startDate: START_DATE,
      endDate: END_DATE,
      boatDims: { length: 12, width: 4, draft: 2 }
    });

    // 5. Test Sovrapposizione Prenotazioni
    // Prima inseriamo una prenotazione falsa per bloccare il primo ormeggio grande
    const berthToBlock = results.case4_destination.find((b: any) => b.max_length >= 24);
    
    if (berthToBlock) {
      // Inseriamo un utente fake per la prenotazione se necessario, 
      // ma dato che owner/boater possono essere null nello schema (SET NULL), inseriamo solo booking
      const { data: booking, error: bookingErr } = await supabase.from("bookings").insert({
        marina_id: berthToBlock.marinas.id,
        berth_id: berthToBlock.id,
        check_in: "2026-07-02", // Sovrappone 01-04
        check_out: "2026-07-05",
        status: "CONFIRMED",
        berth_price: 100,
        total_price: 100
      }).select().single();

      if (!bookingErr) {
        // Eseguiamo la ricerca e verifichiamo che l'ormeggio non ci sia
        const searchAfterBooking = await searchAvailableBerths({
          destination: "Cervo",
          startDate: START_DATE,
          endDate: END_DATE,
          boatDims: { length: 20, width: 5, draft: 3 }
        });

        results.case5_overlap = {
          blockedBerthId: berthToBlock.id,
          foundInResults: searchAfterBooking.some(b => b.id === berthToBlock.id),
          totalAvailable: searchAfterBooking.length
        };

        // Pulizia
        await supabase.from("bookings").delete().eq("id", booking.id);
      } else {
        results.case5_overlap = { error: bookingErr };
      }
    }

    // 6. Test Calcolo Prezzi
    const sampleBerth = results.case1_smallBoat[0];
    results.case6_pricing = {
      base_price_per_night: sampleBerth?.base_price,
      total_nights: 3, // dal 01 al 04 luglio
      expected_total: (sampleBerth?.base_price || 0) * 3
    };

    return NextResponse.json({ success: true, tests: results });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
