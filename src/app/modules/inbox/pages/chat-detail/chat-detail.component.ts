import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { ChatContainerComponent } from "../../../chatbot/components/chat-container/chat-container.component";
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '../../../chatbot/shared.module';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrl: './chat-detail.component.css',
  standalone: true,
  imports: [CommonModule, ChatContainerComponent, SharedModule, MatCardModule]
})
export class ChatDetailComponent implements OnInit {
  chat: Chat | null = null;
  idChat: string | null = null;  // Mantener como string desde la URL
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idChat = params['id'];  
      
      if (this.idChat) {
        this.loadChatDetail();
      }
    });
  }

  loadChatDetail(): void {
    if (!this.idChat) return;
    
    this.loading = true;
    this.error = null;

    const chatId = parseInt(this.idChat);

    this.chatService.getChatWithIdChat(chatId).subscribe({
      next: (data) => {
        this.chat = data.response;
        this.loading = false;
        console.log('Chat cargado:', this.chat);
      },
      error: (error) => {
        console.error('Error al cargar chat:', error);
        console.error('Datos enviados:', { idChat: chatId });
        this.error = 'Error al cargar el chat';
        this.loading = false;
      }
    });
  }
}
