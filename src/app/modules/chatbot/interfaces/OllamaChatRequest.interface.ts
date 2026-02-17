/**
 * Interfaz para enviar mensajes al endpoint /api/chat de Ollama con contexto
 */
export interface OllamaChatRequest {
    idUser: string;
    model?: string;
    idChat?: string;
    messages: ChatMessageItem[];
    stream?: boolean;
}

/**
 * Representa un mensaje individual en la conversación para el API de chat
 */
export interface ChatMessageItem {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    images?: string[];
}
