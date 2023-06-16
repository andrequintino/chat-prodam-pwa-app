export type PGChunk = {
  essay_date: string;
  content: string;  
  content_length: number;
  content_tokens: number;
  embedding: number[];
};