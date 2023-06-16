import { createClient } from "@supabase/supabase-js";
import { PGChunk } from "../types/PGChunk";
export const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!);
export const config = {
  runtime: "edge"
};
export const find = {
  chunks: async (query: string, apiKey: string, matches: number) => {
    const input = query.replace(/\n/g, " ");
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input
      })
    });

    const json = await res.json();
    const embedding = json.data[0].embedding;
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