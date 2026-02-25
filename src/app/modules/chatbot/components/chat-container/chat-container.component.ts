import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../input-field/input-field.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { SharedModule } from '../../shared.module';
import { Message } from '../../interfaces/Message.interface';
import { ChatService } from '../../../inbox/services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { OllamaChatRequest, ChatMessageItem } from '../../interfaces/OllamaChatRequest.interface';
import { StreamChunk } from '../../interfaces/StreamChunk.interface';

@Component({
  selector: 'app-chat-container',
  imports: [CommonModule, ChatAreaComponent, InputFieldComponent, SharedModule],
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.css',
  standalone: true
})
export class ChatContainerComponent implements OnDestroy {
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
  isStreaming: boolean = false;
  currentResponse: string = '';
  currentThinking: string = '';
  selectedModel: string = 'qwen3:8b';
  private streamSubscription: Subscription | null = null;

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

  toggleThinkingCollapsed(timestamp: string): void {
    this.messagesArray = this.messagesArray.map((msg) => {
      if (msg.timestamp !== timestamp) return msg;
      return {
        ...msg,
        thinkingCollapsed: !msg.thinkingCollapsed
      };
    });
  }

  private isDraftChat(): boolean {
    return !this.idChat || this.idChat === 'new';
  }

  private resolveChatId(response: any): string | null {
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

  private updateBotStreamingMessage(timestamp: string, content: string, streaming: boolean): void {
    this.messagesArray = this.messagesArray.map((msg) =>
      msg.timestamp === timestamp
        ? { ...msg, content, streaming }
        : msg
    );
  }

  private updateBotThinkingState(
    timestamp: string,
    changes: Pick<Message, 'showThinking' | 'thinkingContent' | 'thinkingCollapsed'>
  ): void {
    this.messagesArray = this.messagesArray.map((msg) =>
      msg.timestamp === timestamp
        ? { ...msg, ...changes }
        : msg
    );
  }

  private finalizeStreamingState(): void {
    this.isSending = false;
    this.isStreaming = false;
  }

  ngOnDestroy(): void {
    this.streamSubscription?.unsubscribe();
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
    const botMessageTimestamp = (Date.now() + 1).toString();
    const botStreamingMessage: Message = {
      content: '',
      isUser: false,
      role: 'assistant',
      timestamp: botMessageTimestamp,
      streaming: false,
      showThinking: false,
      thinkingContent: '',
      thinkingCollapsed: false
    };

    this.messagesArray = [...this.messagesArray, userMessage, botStreamingMessage];
    this.message = ''; // Limpiar input

    // Prepare only last message for backend (it handles history from DB)
    // Preparar solo el último mensaje para backend (el historial viene de DB)
    const currentUser = this.authService.getCurrentUser();
    const chatMessages: ChatMessageItem[] = [{
      role: userMessage.role === 'bot' ? 'assistant' : userMessage.role,
      content: userMessage.content
    }];

    const payload: OllamaChatRequest = {
      idUser: currentUser?.idUser?.toString() || '',
      model: this.selectedModel,
      idChat: this.idChat === 'new' ? '' : this.idChat,
      messages: chatMessages,
      stream: true
    };

    this.isSending = true;
    this.isStreaming = true;
    this.currentResponse = '';
    this.currentThinking = '';

    this.streamSubscription?.unsubscribe();
    this.streamSubscription = this.chatService.streamChat(payload).subscribe({
      next: (chunk: StreamChunk) => {
        switch (chunk.type) {
          case 'thinking_start':
            this.updateBotThinkingState(botMessageTimestamp, {
              showThinking: true,
              thinkingContent: this.currentThinking,
              thinkingCollapsed: false
            });
            break;
          case 'thinking':
            if (chunk.content) {
              this.currentThinking += chunk.content;
              this.updateBotThinkingState(botMessageTimestamp, {
                showThinking: true,
                thinkingContent: this.currentThinking,
                thinkingCollapsed: false
              });
            }
            break;
          case 'thinking_end':
            this.updateBotThinkingState(botMessageTimestamp, {
              showThinking: true,
              thinkingContent: this.currentThinking,
              thinkingCollapsed: true
            });
            break;
          case 'response':
            if (chunk.content) {
              this.currentResponse += chunk.content;
              this.updateBotStreamingMessage(botMessageTimestamp, this.currentResponse, true);
              this.updateBotThinkingState(botMessageTimestamp, {
                showThinking: this.currentThinking.length > 0,
                thinkingContent: this.currentThinking,
                thinkingCollapsed: true
              });
            }
            break;
          case 'done': {
            this.updateBotStreamingMessage(botMessageTimestamp, this.currentResponse, false);
            this.finalizeStreamingState();
            const createdChatId = this.resolveChatId(chunk);
            if ((this.isDraftChat() || chunk.isNewChat) && createdChatId) {
              this.idChat = createdChatId;
              this.chatCreated.emit(createdChatId);
            }
            break;
          }
          case 'error':
            this.finalizeStreamingState();
            this.updateBotStreamingMessage(
              botMessageTimestamp,
              this.currentResponse || chunk.error || 'Error al comunicarse con el bot. Por favor intenta de nuevo.',
              false
            );
            break;
        }
      },
      error: (error) => {
        console.error('Error en stream de chat:', error);
        this.finalizeStreamingState();
        this.updateBotStreamingMessage(
          botMessageTimestamp,
          this.currentResponse || 'Error al comunicarse con el bot. Por favor intenta de nuevo.',
          false
        );
      },
      complete: () => {
        this.finalizeStreamingState();
        this.updateBotStreamingMessage(botMessageTimestamp, this.currentResponse, false);
      }
    });
  }


}
