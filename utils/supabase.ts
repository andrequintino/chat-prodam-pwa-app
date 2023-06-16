import { createClient } from "@supabase/supabase-js";
import { openai } from "./openai";
import { PGChunk } from "../types/PGChunk";
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!);
export const config = {
  runtime: "edge"
};
export const database = {
  findChunks: async (query: string, apiKey: string, matches: number) => {
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
  },
  insertData: async (chunk: PGChunk, embedding: number[]) => {
    const { essay_date, content, content_length, content_tokens } = chunk;
    const { error } = await supabaseAdmin
          .from("pg")
          .insert({
            essay_date,
            content,
            content_length,
            content_tokens,
            embedding
          })
          .select("*");
    if (error) {
      console.log("error on database insert", error);
    } 
  }
}