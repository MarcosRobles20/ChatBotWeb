export interface Message {
    content: string;
    isUser: boolean;
    role: 'user' | 'bot';
    timestamp: number;
  }