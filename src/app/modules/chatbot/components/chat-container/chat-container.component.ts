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
import { AgentEvent, StreamChunk } from '../../interfaces/StreamChunk.interface';
import { McpEventViewerComponent } from "../mcp-event-viewer/mcp-event-viewer.component";

interface SourceItem {
  title?: string;
  url: string;
  snippet?: string;
}

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
  selectedModel: string = 'qwen3.5:9b';
  private streamSubscription: Subscription | null = null;
  mcpChunks: StreamChunk[] = [];

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
      timestamp: Date.now().toString(),
      kind: 'text'
    };

    // Create new array so Angular detects the change
    // Crear nuevo array para que Angular detecte el cambio
    const botMessageTimestamp = (Date.now() + 1).toString();
    const botStreamingMessage: Message = {
      content: '',
      isUser: false,
      role: 'assistant',
      timestamp: botMessageTimestamp,
      streaming: true, // <-- activar animación desde el inicio
      showThinking: true, // <-- mostrar thinking desde el inicio
      thinkingCollapsed: false,
      agentEvents: [],    // <-- inicializar array
      kind: 'text'
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
      stream: true,
      kind: 'text'
    };

    this.isSending = true;
    this.isStreaming = true;
    this.currentResponse = '';
    this.currentThinking = '';
    // this.currentSources = [];
    // this.sourcesAppended = false;

    this.streamSubscription?.unsubscribe();
    this.streamSubscription = this.chatService.streamChat(payload).subscribe({
      next: (chunk: StreamChunk) => {
        try {
          // Encuentra el mensaje bot actual
          const botMsgIdx = this.messagesArray.findIndex(m => m.timestamp === botMessageTimestamp);
          if (botMsgIdx === -1) return;
          const botMsg = this.messagesArray[botMsgIdx];
          // let steps = botMsg.reasoningSteps ? [...botMsg.reasoningSteps] : [];
          switch (chunk.type) {
            case 'agent_event': {
              const eventChunk: StreamChunk = {
                type: 'agent_event',
                content: chunk.content || '',
                data: chunk.data,
                event_type: chunk.event_type,
                metadata: chunk.metadata || chunk.data?.metadata || {},
              };
              // Construir nuevo array de agentEvents
              const newAgentEvents = botMsg.agentEvents ? [...botMsg.agentEvents, eventChunk] : [eventChunk];

              // Si es un agent_event de tipo 'source', extraer referencia
              let newReferences = botMsg.references ? [...botMsg.references] : [];
              if (eventChunk.event_type === 'source' && eventChunk.metadata?.url) {
                newReferences.push({
                  title: eventChunk.metadata.title || eventChunk.content || eventChunk.metadata.url,
                  url: eventChunk.metadata.url,
                  source: eventChunk.content || undefined,
                  snippet: eventChunk.metadata.snippet || undefined
                });
              }

              const updatedMsg = {
                ...botMsg,
                showThinking: true,
                thinkingCollapsed: false,
                agentEvents: newAgentEvents,
                references: newReferences.length > 0 ? newReferences : undefined
              };
              this.messagesArray[botMsgIdx] = updatedMsg;
              console.log('Nuevo agent_event agregado al mensaje:', eventChunk);
              break;
            }
            case 'token': {
              // Minimiza el bloque de reasoning al empezar la respuesta
              if (botMsg.showThinking && !botMsg.thinkingCollapsed) {
                this.messagesArray[botMsgIdx] = {
                  ...botMsg,
                  showThinking: true,
                  thinkingCollapsed: true,
                  // reasoningSteps: steps
                };
              }
              const text = chunk.data?.text || chunk.content || '';
              if (text) {
                this.currentResponse += text;
                this.updateBotStreamingMessage(botMessageTimestamp, this.currentResponse, true);
              }
              break;
            }
            case 'image': {
              const imageUrl = chunk.data?.url || chunk.content || '';
              if (imageUrl.trim().length > 0) {
                const imageMessage: Message = {
                  content: imageUrl,
                  isUser: false,
                  role: 'assistant',
                  timestamp: (Date.now() + 2).toString(),
                  streaming: false,
                  showThinking: false,
                  thinkingContent: '',
                  thinkingCollapsed: true,
                  kind: 'image'
                };
                this.messagesArray = [...this.messagesArray, imageMessage];
              }
              break;
            }
            case 'done': {
              this.isStreaming = false;
              // Actualiza el mensaje bot con el contenido final y el timestamp de finalización
              this.messagesArray = this.messagesArray.map((msg) =>
                msg.timestamp === botMessageTimestamp
                  ? { ...msg, content: this.currentResponse, streaming: false, timestamp: Date.now().toString() }
                  : msg
              );
              this.finalizeStreamingState();
              const createdChatId = this.resolveChatId(chunk);
              if ((this.isDraftChat() || chunk.isNewChat) && createdChatId) {
                this.idChat = createdChatId;
                this.chatCreated.emit(createdChatId);
              }
              break;
            }
            case 'error': {
              this.finalizeStreamingState();
              const errorMsg = chunk.data?.message || chunk.error || 'Error al comunicarse con el bot. Por favor intenta de nuevo.';
              this.updateBotStreamingMessage(
                botMessageTimestamp,
                errorMsg,
                false
              );
              break;
            }
            default:
              // Para tipos no reconocidos, no hacer nada
              break;
          }
        } catch (err) {
          // Parsing tolerante a errores
          console.error('Error procesando chunk SSE:', err, chunk);
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
        // this.ensureReferencesAppended();
        this.updateBotStreamingMessage(botMessageTimestamp, this.currentResponse, false);
      }
    });
  }

}
