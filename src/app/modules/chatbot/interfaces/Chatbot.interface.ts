import { Message } from "./Message.interface";

export interface Chatbot {
  idUser: number;
  chatMessages: Message[];
  lastUpdated: Date;
  id: number;
}