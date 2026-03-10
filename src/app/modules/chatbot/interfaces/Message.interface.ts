import { AgentEvent, StreamChunk } from "./StreamChunk.interface";

export interface Message {
  content: string;
  isUser: boolean;
  role: 'user' | 'bot' | 'assistant' | 'system';
  timestamp: string;
  streaming?: boolean;
  showThinking?: boolean;
  thinkingContent?: string;
  thinkingCollapsed?: boolean;
  kind?: 'text' | 'image' | 'file' | 'mcp-chunk';
  messageOrder?: number;

  reasoningSteps?: Array<{ type: string; text: string; data?: any }>;
  agentEvents?: StreamChunk[];

  // Referencias/fuentes consultadas para mostrar al final de la respuesta
  references?: Array<{
    title?: string;
    url: string;
    source?: string;
    snippet?: string;
  }>;
}