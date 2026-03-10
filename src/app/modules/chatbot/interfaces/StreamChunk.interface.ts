// ========================
// Chunk base de streaming
// ========================
export interface StreamChunk {
  type:
    | 'thinking_start'
    | 'thinking'
    | 'thinking_end'
    | 'plan'
    | 'tool_call'
    | 'tool_result'
    | 'sources'
    | 'response'
    | 'image'
    | 'done'
    | 'error'
    | 'token'
    | 'content'
    | 'mcp-chunk'
    | 'agent_event'  // importante usar singular para consistencia
    | string;

  content?: string;         // texto o contenido principal del chunk
  tool?: string;            // nombre de la herramienta (si aplica)
  data?: any;               // payload extra de la tool o RAG
  meta?: any;               // metadatos generales
  metadata?: AgentEventMetadata; // metadata específica de agent_event
  event_type?: string;      // tipo específico dentro de agent_event (tool_call, tool_result, status, etc.)

  idChat?: string;
  isNewChat?: boolean;
  model?: string;
  error?: string;

  kind?: 'text' | 'image' | 'file';
}

// ========================
// Agent Event
// ========================
export interface AgentEvent {
  type: string;             // siempre 'agent_event'
  content: string;          // texto principal del evento
  metadata?: AgentEventMetadata;  // metadata opcional
  event_type: string;      // tipo específico del evento (tool_call, tool_result, status, etc.)
}

// ========================
// Metadata de Agent Event
// ========================
export interface AgentEventMetadata {
  url?: string;             // enlace a la fuente
  title?: string;           // título del artículo
  snippet?: string;         // resumen o extracto breve
  query?: string;           // término de búsqueda (si aplica)
  [key: string]: any;       // campos dinámicos que puedan aparecer
}