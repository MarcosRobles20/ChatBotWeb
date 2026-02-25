export interface Message {
    content: string;
    isUser: boolean;
    role: 'user' | 'bot' | 'assistant' | 'system' ;
    timestamp: string;
  streaming?: boolean;
  showThinking?: boolean;
  thinkingContent?: string;
  thinkingCollapsed?: boolean;
  }