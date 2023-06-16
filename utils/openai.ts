import { ChatMessage } from "../types/ChatMessage";
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { find, supabaseAdmin } from './supabase';
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
      const chunks: PGChunk[] = await find.chunks(query, config.OPENAI_API_Key!, 5);
      const prompt = endent`
        Use o texto a seguir, porém não mencione que o utilizou, para responder a seguinte questão: "${query}"

        ${chunks?.map((d: any) => d.content).join("\n\n")}
      `;
      console.log(prompt);
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
  generateEmbeddings: async (essays: PGEssay[]) => {
    for (let i = 0; i < essays.length; i++) {
      const section = essays[i];
  
      for (let j = 0; j < section.chunks.length; j++) {
        const chunk = section.chunks[j];
  
        const { essay_title, essay_url, essay_date, essay_thanks, content, content_length, content_tokens } = chunk;
  
        const embeddingResponse = await api.createEmbedding({
          model: "text-embedding-ada-002",
          input: content
        });
  
        const [{ embedding }] = embeddingResponse.data.data;
  
        const { data, error } = await supabaseAdmin
          .from("pg")
          .insert({
            essay_title,
            essay_url,
            essay_date,
            essay_thanks,
            content,
            content_length,
            content_tokens,
            embedding
          })
          .select("*");
  
        if (error) {
          console.log("error", error);
        } else {
          console.log("saved", i, j);
        }
  
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }
}