import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { ChatContainerComponent } from "../../../chatbot/components/chat-container/chat-container.component";
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '../../../chatbot/shared.module';
import { Message } from '../../../chatbot/interfaces/Message.interface';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrl: './chat-detail.component.css',
  standalone: true,
  imports: [CommonModule, ChatContainerComponent, SharedModule, MatCardModule]
})
export class ChatDetailComponent implements OnInit {
  chat: Chat | null = null;
  messages: Message[] = [];
  idChat: string = "";  // Mantener como string desde la URL
  loading = false;
  error: string | null = null;
  private skipNextRouteLoad = false;
  @Output() IdChat = new EventEmitter<string>();

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idChat = params['id'] || '';
      this.IdChat.emit(this.idChat);

      if (this.skipNextRouteLoad && this.idChat && this.idChat !== 'new') {
        this.skipNextRouteLoad = false;
        return;
      }

      if (this.idChat && this.idChat !== 'new') {
        this.loadChatDetail();
        return;
      }

      this.initializeDraftChat();
    });
  }

  private initializeDraftChat(): void {
    this.loading = false;
    this.error = null;
    this.chat = {
      idChat: '',
      idUser: '',
      title: '',
      message: null,
      lastModified: new Date().toISOString(),
      messages: [],
      totalMessages: 0,
      maxMessages: 100,
      success: true
    };
    this.messages = [];
  }

  onChatCreated(chatId: string): void {
    const normalizedChatId = (chatId || '').trim();
    if (!normalizedChatId || normalizedChatId === this.idChat) {
      return;
    }

    this.idChat = normalizedChatId;
    if (this.chat) {
      this.chat.idChat = normalizedChatId;
    }

    this.skipNextRouteLoad = true;
    this.chatService.requestChatsRefresh();
    this.router.navigate(['/inbox/chat', normalizedChatId], { replaceUrl: true });
  }

  loadChatDetail(): void {
    if (!this.idChat) return;
    
    this.loading = true;
    this.error = null;

    const chatId = this.idChat;

    this.chatService.getChatMessages(chatId).subscribe({
      next: (data) => {
        this.chat = data;
        // Mapear los mensajes al formato esperado
        this.messages = this.mapApiMessagesToMessageFormat(data.messages || []);
        this.loading = false;
        console.log('Chat cargado:', this.chat, 'Mensajes:', this.messages);
      },
      error: (error) => {
        console.error('Error al cargar chat:', error);
        console.error('Datos enviados:', { idChat: chatId });
        this.error = 'Error al cargar el chat';
        this.loading = false;
      }
    });
  }

  private mapApiMessagesToMessageFormat(apiMessages: any[]): Message[] {
    return apiMessages.map((msg) => ({
      content: msg.role === 'user' ? msg.userMessage : msg.aiResponse,
      isUser: msg.role === 'user',
      role: msg.role,
      timestamp: msg.createDate
    }));
  }
}
