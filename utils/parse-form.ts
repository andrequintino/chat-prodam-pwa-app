import type { NextApiRequest } from "next";
import formidable from "formidable";

export const FormidableError = formidable.errors.FormidableError;

export const parseForm = async (
  req: NextApiRequest,
  opts: any
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((accept, reject) => {
    const form = formidable(opts);

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return accept({ fields, files });
    });  
  });
};