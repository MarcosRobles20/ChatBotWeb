export interface StreamChunk {
  type: 'thinking_start' | 'thinking' | 'thinking_end' | 'plan' | 'tool_call' | 'tool_result' | 'sources' | 'response' | 'image' | 'done' | 'error';
  content?: string;
  idChat?: string;
  isNewChat?: boolean;
  model?: string;
  error?: string;
  kind?: 'text' | 'image' | 'file';
}
