export type ChatMessage = {
  id: string;
  author: 'me' | 'ai' | 'system';
  body: string;
}