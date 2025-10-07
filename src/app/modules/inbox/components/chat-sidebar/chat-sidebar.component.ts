import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Chat } from '../../interfaces/chat.interface';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.css']
})
export class ChatSidebarComponent implements OnInit {

  @Output() chatSelected = new EventEmitter<Chat>();
  @Input() selectedChatId: number | null = null;
  
  chats: Chat[] = [];
  loading = false;
  error: string | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats(): void {
    this.loading = true;
    this.error = null;
    
    this.chatService.getChatsWithIdUser().subscribe({
      next: (data) => {
        this.chats = Array.isArray(data) ? data : data.response || [];
        this.loading = false;
        console.log('Chats cargados en sidebar:', this.chats);
      },
      error: (error) => {
        console.error('Error al cargar chats en sidebar:', error);
        this.error = 'Error al cargar los chats';
        this.loading = false;
      }
    });
  }

  onChatClick(chat: Chat): void {
    this.selectedChatId = chat.idChat;
    this.chatSelected.emit(chat);
  }

  isSelected(chatId: number): boolean {
    return this.selectedChatId === chatId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refreshChats(): void {
    this.loadChats();
  }

  createNewChat() {
    
  }

}