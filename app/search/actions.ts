"use server";

import { createClient } from "@/lib/supabase/server";

export async function searchMedicines(searchTerm: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_medicines", {
    search_term: searchTerm,
  });

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  return data || [];
}
