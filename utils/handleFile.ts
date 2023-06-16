import { PGEssay } from "../types/PGEssay";
import { PGJSON } from "../types/PGJSON";
import { PGChunk } from "../types/PGChunk";
import { encode } from "gpt-3-encoder";
const pdf = require("pdf-parse");
var formatISO = require('date-fns/formatISO'); 
const CHUNK_SIZE = 400;

function render_page(pageData: any) {
  let render_options = {
      normalizeWhitespace: false,
      disableCombineTextItems: false
  }

  return pageData.getTextContent(render_options)
  .then(function(textContent: any) {
      let lastY, text = '';
      for (let item of textContent.items) {
          const s = item.str.replaceAll("Ɵ","ti");
          if (lastY == item.transform[5] || !lastY){
              text += s;
          }  
          else{
              text += '\n' + s;
          }    
          lastY = item.transform[5];          
      }
      return text;
  });
}

export const handleFile = {
  getTextFromPDF: async (file: any) => {
    return new Promise(function(resolve, reject) {
      let essays: any[] = [];
      let essay: PGEssay = {
        date: "",
        content: "",
        length: 0,
        tokens: 0,
        chunks: []
      };  
      let trimmedContent: string = "";
      let options = {
        pagerender: render_page
      }
      pdf(file, options).then(async function(data:any) {
        trimmedContent = data.text.trim(); 
        essay = {
          date: formatISO(new Date()),
          content: trimmedContent,
          length: trimmedContent.length,
          tokens: encode(trimmedContent).length,
          chunks: []
        }; 
        const chunkedEssay = await handleFile.chunkEssay(essay);
        essays.push(chunkedEssay);
        const json: PGJSON = {
          current_date: formatISO(new Date()),
          author: "Andre Quintino",
          length: essays.reduce((acc, essay) => acc + essay.length, 0),
          tokens: essays.reduce((acc, essay) => acc + essay.tokens, 0),
          essays
        };       
        console.log(json);
        resolve(JSON.stringify(json));        
      });       
    });    
  },
  chunkEssay: async (essay: PGEssay) => {
    const { date, content, ...chunklessSection } = essay;
  
    let essayTextChunks = [];
  
    if (encode(content).length > CHUNK_SIZE) {
      const split = content.split(". ");
      let chunkText = "";
  
      for (let i = 0; i < split.length; i++) {
        const sentence = split[i];
        const sentenceTokenLength = encode(sentence).length;
        const chunkTextTokenLength = encode(chunkText).length;
  
        if (chunkTextTokenLength + sentenceTokenLength > CHUNK_SIZE) {
          essayTextChunks.push(chunkText);
          chunkText = "";
        }
  
        if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
          chunkText += sentence + ". ";
        } else {
          chunkText += sentence + " ";
        }
      }
  
      essayTextChunks.push(chunkText.trim());
    } else {
      essayTextChunks.push(content.trim());
    }
  
    const essayChunks = essayTextChunks.map((text) => {
      const trimmedText = text.trim();
  
      const chunk: PGChunk = {
        essay_date: date,
        content: trimmedText,
        content_length: trimmedText.length,
        content_tokens: encode(trimmedText).length,
        embedding: []
      };
  
      return chunk;
    });
  
    if (essayChunks.length > 1) {
      for (let i = 0; i < essayChunks.length; i++) {
        const chunk = essayChunks[i];
        const prevChunk = essayChunks[i - 1];
  
        if (chunk.content_tokens < 100 && prevChunk) {
          prevChunk.content += " " + chunk.content;
          prevChunk.content_length += chunk.content_length;
          prevChunk.content_tokens += chunk.content_tokens;
          essayChunks.splice(i, 1);
          i--;
        }
      }
    }
  
    const chunkedSection: PGEssay = {
      ...essay,
      chunks: essayChunks
    };
  
    return chunkedSection;
  }
}
