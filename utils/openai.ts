import { ChatMessage } from "../types/ChatMessage";
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { database } from './supabase';
import { config } from './config';
import { PGChunk } from "../types/PGChunk";
import endent from "endent";
import { PGEssay } from "../types/PGEssay";
const configOpenAI = new Configuration({
  apiKey: config.OPENAI_API_KEY,
  organization: config.ORGANIZATION_ID
});

const api = new OpenAIApi(configOpenAI);

export const openai = {
  generate: async (messages: ChatCompletionRequestMessage[]) => {
    try {
      const query = messages[messages.length -1].content;
      const chunks: PGChunk[] = await database.findChunks(query, 5);
      // const inputWords = query.replaceAll("?", "")
      //                         .replaceAll("!", "")
      //                         .replaceAll(".", "")
      //                         .replaceAll(",", "")
      //                         .replaceAll(":", "")
      //                         .replaceAll(/quando/gi, "")                              
      //                         .replaceAll(/porque/gi, "")
      //                         .replaceAll(/porquê/gi, "")
      //                         .split(" ");
      // const searchRegex  = new RegExp(inputWords.filter(x => x.length > 4).join('|'), 'i');
      // chunks?.map((d: any) => {        
      //   console.log(d.content.match(searchRegex));
      //   if (d.content.match(searchRegex) && d.content.match(searchRegex).length >= inputWords.length)
      //     console.log(d.content);
      // })
      
      const prompt = endent`
      Você é o chatProdam, um assistente que deve responder corretamente sobre a empresa Prodam (Empresa de Tecnologia da Informação e Comunicação do Município de São Paulo). 
      Substitua Prodam-SP por Prodam. Tente usar suas próprias palavras quando possível. Seja preciso, útil, conciso e claro. 
      Não diga "conforme mencionado no texto" na sua resposta.
      Não diga "não foi mencionado no texto fornecido" na sua resposta.
      Não diga "não foi foi fornecido no texto" na sua resposta.
      Caso não encontre a informação no texto fornecido, responda apenas:
      "Não consegui encontrar a informação desejada.". 
      Utilizando o texto fornecido, responda a seguinte questão: "${query}"

        ${chunks?.map((d: any) => d.content).join("\n\n")}
      `;
      console.log(prompt);
      messages[messages.length -1].content = prompt;
      const response = await api.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 0.0,
        messages
      });
      return response.data.choices[0]?.message?.content;      
    } catch (error) {
      console.log(error);
      return 'Não consegui entender a pergunta. Por favor, pergunte novamente.';      
    }    
  },
  translateMessages: (messages: ChatMessage[]) => {
    let reqMessages: ChatCompletionRequestMessage[] = [];

    for (let i in messages) {      
      let role: ChatCompletionRequestMessageRoleEnum = 'user';
      if (messages[i].author === 'system')
        role = 'system';
      else if (messages[i].author === 'ai')
        role = 'assistant'

      reqMessages.push({
        role: role,
        content: messages[i].body
      });
    }

    return reqMessages;
  },
  getEmbedding: async (query: string) => {    
    const embeddingResponse = await api.createEmbedding({
      model: "text-embedding-ada-002",
      input: query
    });

    const [{ embedding }] = embeddingResponse.data.data;
    return embedding;
  },
  saveEmbeddings: async (essays: PGEssay[]) => {
    for (let i = 0; i < essays.length; i++) {
      const section = essays[i];
  
      for (let j = 0; j < section.chunks.length; j++) {
        const chunk = section.chunks[j];
        const { content } = chunk;
        const embedding = await openai.getEmbedding(content);
  
        await database.insertData(chunk, embedding);
  
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }
}