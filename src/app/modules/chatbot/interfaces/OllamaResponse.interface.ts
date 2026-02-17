export interface OllamaResponse {
    success: boolean;
    userPrompt: string;
    aiResponse: string;
    model: string;
    timestamp: string;
    idChat?: string;
    IdChat?: string;
    chatId?: string;
    message?: string;
    error?: string;
}