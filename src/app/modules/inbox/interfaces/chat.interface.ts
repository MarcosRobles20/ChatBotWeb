export interface Chat {
    idChat: string;
    idUser: string;
    message: string | null;
    lastModified: string;
    title: string;
    messages: Array<{
        id: number;
        idChat: string;
        idUser: string;
        content: string;
        aiResponse: string;
        createDate: string;
        messageOrder: number;
        role: 'user' | 'assistant';
        model?: string | null;
        isDeleted: boolean;
        tokenCount?: number | null;
    }>;
    totalMessages: number;
    maxMessages: number;
    success: boolean;
}