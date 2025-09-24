import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { Chat } from '../../interfaces/chat.interface';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    ChatSidebarComponent
  ],
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.css']
})
export class ChatLayoutComponent implements OnInit {
  selectedChat: Chat | null = null;
  sidenavOpened = true;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onChatSelected(chat: Chat): void {
    this.selectedChat = chat;
    console.log('Chat seleccionado:', chat);
    
    // Navegar al detalle del chat con la nueva ruta
    this.router.navigate(['/inbox/chat', chat.idChat]);
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  get selectedChatId(): number | null {
    return this.selectedChat?.idChat || null;
  }
}