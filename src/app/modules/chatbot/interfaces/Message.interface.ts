export interface Message {
    content: string;
    isUser: boolean;
    role: 'user' | 'bot' | 'assistant' | 'system' ;
    timestamp: string;
    
  }