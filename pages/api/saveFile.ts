import type { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "../../utils/parse-form";
import { handleFile } from "../../utils/handleFile";
import { PGJSON } from "../../types/PGJSON";
import { openai } from "../../utils/openai";
import { Writable } from "stream";
import { Buffer } from "buffer";

const fileConsumer = (acc: any) => {
  const writable = new Writable({
    write: (chunk: any, _enc: any, next: any) => {
      acc.push(chunk);
      next();
    },
  });

  return writable;
};

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 2,
  allowEmptyFiles: false,
  multiples: false,
};

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
  
  try {
    const chunks: any[] = [];
    const { fields, files } = await parseForm(req, {
      ...formidableConfig,
      // consume this, otherwise formidable tries to save the file to disk
      fileWriteStreamHandler: () => fileConsumer(chunks),
    });

    const contents = Buffer.concat(chunks);    
    const json = await handleFile.getTextFromPDF(contents);
    const trainingData: PGJSON = JSON.parse(json as string);
    await openai.saveEmbeddings(trainingData.essays);
    const message = "Arquivo carregado com sucesso!";
    res.status(200).json({
      data: {
        message,
      },
      error: null,
    });
  } catch (e) {
    console.error(e);
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ data: null, error: e.message });
    } else {      
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