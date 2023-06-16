import type { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "../../utils/parse-form";
import { handleFile } from "../../utils/handleFile";
import { PGJSON } from "../../types/PGJSON";
import { openai } from "../../utils/openai";
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      message: string;
    } | null;
    error: string | null;
  }>
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      data: null,
      error: "Method Not Allowed",
    });
    return;
  }
  // Just after the "Method Not Allowed" code
  try {
    const { fields, files } = await parseForm(req);
    const file = files.media;
    let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;    
    const json = await handleFile.getTextFromPDF(url as string);
    const trainingData: PGJSON = JSON.parse(json as string);
    await openai.generateEmbeddings(trainingData.essays);
    const message = "Arquivo carregado com sucesso!";
    res.status(200).json({
      data: {
        message,
      },
      error: null,
    });
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ data: null, error: e.message });
    } else {
      console.error(e);
      res.status(500).json({ data: null, error: "Internal Server Error" });
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;