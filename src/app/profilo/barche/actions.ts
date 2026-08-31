"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBoat(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Devi essere loggato per aggiungere una barca.");
  }

  const name = formData.get("name") as string;
  const boat_type = formData.get("boat_type") as string;
  const length = parseFloat(formData.get("length") as string);
  const width = parseFloat(formData.get("width") as string);
  const draft = parseFloat(formData.get("draft") as string);
  const height = formData.get("height") ? parseFloat(formData.get("height") as string) : null;
  const passengers_capacity = formData.get("passengers_capacity") ? parseInt(formData.get("passengers_capacity") as string, 10) : null;
  const flag = formData.get("flag") as string;

  const { error } = await supabase
    .from("boats")
    .insert({
      owner_id: user.id,
      name,
      boat_type,
      length,
      width,
      draft,
      height,
      passengers_capacity,
      flag
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profilo/barche");
}
