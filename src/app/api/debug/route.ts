import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  
  const { data: marinas, error: err1 } = await supabase.from("marinas").select("*");
  const { data: piers, error: err2 } = await supabase.from("piers").select("*");
  const { data: berths, error: err3 } = await supabase.from("berths").select("*");
  
  return NextResponse.json({
    marinas_count: marinas?.length,
    piers_count: piers?.length,
    berths_count: berths?.length,
    errors: { err1, err2, err3 }
  });
}
