export type PGChunk = {
  essay_title: string;
  essay_url: string;
  essay_date: string;
  essay_thanks: string;
  content: string;
  content_length: number;
  content_tokens: number;
  embedding: number[];
};