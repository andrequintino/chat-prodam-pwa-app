import { createClient } from "@supabase/supabase-js";
import { openai } from "./openai";
export const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!);
export const config = {
  runtime: "edge"
};
export const find = {
  chunks: async (query: string, apiKey: string, matches: number) => {
    const embedding = await openai.getEmbedding(query);
    const { data: chunks, error } = await supabaseAdmin.rpc("pg_search", {
      query_embedding: embedding,
      similarity_threshold: 0.5,
      match_count: matches
    });

    if (error) {
      console.error(error);      
    }

    return chunks;
  }
}