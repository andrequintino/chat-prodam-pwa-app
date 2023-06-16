import { PGEssay } from "./PGEssay";

export type PGJSON = {
  current_date: string;
  author: string;
  length: number;
  tokens: number;
  essays: PGEssay[];
};