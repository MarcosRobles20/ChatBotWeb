import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { Chat } from '../../interfaces/chat.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/interfaces/auth.interface';

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
    MatMenuModule,
    ChatSidebarComponent
  ],
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.css']
})
export class ChatLayoutComponent implements OnInit {
  selectedChat: Chat | null = null;
  sidenavOpened = true;
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onChatSelected(chat: Chat): void {
    this.selectedChat = chat;
    console.log('Chat seleccionado:', chat);
    
    this.router.navigate(['/inbox/chat', chat.idChat]);
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get selectedChatId(): string | null {
    return this.selectedChat?.idChat || null;
  }
}