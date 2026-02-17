import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../input-field/input-field.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { SharedModule } from '../../shared.module';
import { Message } from '../../interfaces/Message.interface';
import { ChatService } from '../../../inbox/services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';
import { OllamaResponse } from '../../interfaces/OllamaResponse.interface';
import { OllamaChatRequest, ChatMessageItem } from '../../interfaces/OllamaChatRequest.interface';

@Component({
  selector: 'app-chat-container',
  imports: [CommonModule, ChatAreaComponent, InputFieldComponent, SharedModule],
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.css',
  standalone: true
})
export class ChatContainerComponent {
  @Input() idChat: string = '';
  @Output() chatCreated = new EventEmitter<string>();
  @Input() set messages(msgs: Message[]) {
    this.messagesArray = msgs && msgs.length > 0 ? [...msgs] : [];
  }
  get messages(): Message[] {
    return this.messagesArray;
  }
  private messagesArray: Message[] = [];
  message: string = '';
  isSending = false;
  selectedModel: string = 'mistral:latest';

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  handleInput(event: string): void {
    this.message = event;
  }

  handleModelChange(model: string): void {
    this.selectedModel = model;
    console.log('Modelo seleccionado:', model);
  }

  private isDraftChat(): boolean {
    return !this.idChat || this.idChat === 'new';
  }

  private resolveChatId(response: OllamaResponse): string | null {
    const responseAny = response as any;
    const candidates = [
      responseAny?.idChat,
      responseAny?.IdChat,
      responseAny?.chatId,
      responseAny?.response?.idChat,
      responseAny?.response?.IdChat,
      responseAny?.data?.idChat,
      responseAny?.data?.IdChat
    ];

    const found = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
    return found ? found.trim() : null;
  }

  handleSend(): void {
    const text = typeof this.message === 'string' ? this.message.trim() : '';
    if (!text || this.isSending) return;

    // Add user message immediately
    // Agregar mensaje del usuario inmediatamente
    const userMessage: Message = {
      content: text,
      isUser: true,
      role: 'user',
      timestamp: Date.now().toString()
    };

    // Create new array so Angular detects the change
    // Crear nuevo array para que Angular detecte el cambio
    this.messagesArray = [...this.messagesArray, userMessage];
    this.message = ''; // Limpiar input

    // Prepare message history for Ollama
    // Preparar el historial de mensajes para Ollama
    const currentUser = this.authService.getCurrentUser();
    const chatMessages: ChatMessageItem[] = this.messagesArray.map(msg => ({
      role: msg.role === 'bot' ? 'assistant' : msg.role,
      content: msg.content
    }));

    const payload: OllamaChatRequest = {
      idUser: currentUser?.idUser?.toString() || '',
      model: this.selectedModel,
      idChat: this.idChat === 'new' ? '' : this.idChat,
      messages: chatMessages,
      stream: false
    };

    this.isSending = true;
    this.chatService.sendMessageWithContextChat(payload).pipe(
      finalize(() => this.isSending = false)
    ).subscribe({
      next: (response) => {
        console.log('Respuesta de Ollama:', response);
        // Add bot response - use aiResponse from backend
        // Agregar respuesta del bot - usa aiResponse del backend
        const botMessage: Message = {
          content: response.aiResponse,
          isUser: false,
          role: 'assistant',
          timestamp: response.timestamp
        };
        // Create new array so Angular detects the change
        // Crear nuevo array para que Angular detecte el cambio
        this.messagesArray = [...this.messagesArray, botMessage];

        const createdChatId = this.resolveChatId(response);
        if (this.isDraftChat() && createdChatId) {
          this.idChat = createdChatId;
          this.chatCreated.emit(createdChatId);
        }
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        const errorMessage: Message = {
          content: 'Error al comunicarse con el bot. Por favor intenta de nuevo.',
          isUser: false,
          role: 'assistant',
          timestamp: Date.now().toString()
        };
        // Create new array so Angular detects the change
        // Crear nuevo array para que Angular detecte el cambio
        this.messagesArray = [...this.messagesArray, errorMessage];
      }
    });
  }


}
