import { ChatMessage } from "../types/ChatMessage";
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { database } from './supabase';
import { config } from './config';
import { PGChunk } from "../types/PGChunk";
import endent from "endent";
import { PGEssay } from "../types/PGEssay";
const configOpenAI = new Configuration({
  apiKey: config.OPENAI_API_Key
});

const api = new OpenAIApi(configOpenAI);

export const openai = {
  generate: async (messages: ChatCompletionRequestMessage[]) => {
    try {
      const query = messages[messages.length -1].content;
      const chunks: PGChunk[] = await database.findChunks(query, config.OPENAI_API_Key!, 5);
      const prompt = endent`
        Use o texto a seguir, sem mencionar na resposta que o utilizou, para responder a seguinte questão: "${query}"

        ${chunks?.map((d: any) => d.content).join("\n\n")}
      `;
      messages[messages.length -1].content = prompt;
      const response = await api.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 0.1,
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
    const input = query.replace(/\n/g, " ");
    const embeddingResponse = await api.createEmbedding({
      model: "text-embedding-ada-002",
      input
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