export interface StreamChunk {
  type: 'thinking_start' | 'thinking' | 'thinking_end' | 'response' | 'done' | 'error';
  content?: string;
  idChat?: string;
  isNewChat?: boolean;
  model?: string;
  error?: string;
}
