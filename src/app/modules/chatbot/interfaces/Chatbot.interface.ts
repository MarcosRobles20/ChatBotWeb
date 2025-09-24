import { Message } from "./Message.interface";

export interface Chatbot {
  usuarioId: number;
  mensajes: Message[];
  ultimaActualizacion: Date;
  id: number;
}