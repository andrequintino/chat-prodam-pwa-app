import { PGChunk } from "./PGChunk";

export type PGEssay = {
  date: string;
  content: string;
  length: number;
  tokens: number;
  chunks: PGChunk[];
};