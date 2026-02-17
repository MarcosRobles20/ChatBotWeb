import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Chat } from '../../interfaces/chat.interface';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { User } from '../../../../core/interfaces/auth.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.css']
})
export class ChatSidebarComponent implements OnInit, OnChanges, OnDestroy {

  @Output() chatSelected = new EventEmitter<Chat>();
  @Output() welcomeRequested = new EventEmitter<void>();
  @Output() toggleRequested = new EventEmitter<void>();
  @Input() selectedChatId: string | null = null;
  @Input() minimized: boolean = false;
  
  chats: Chat[] = [];
  loading = false;
  error: string | null = null;
  private subscriptions = new Subscription();

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  get userName(): string {
    const user = this.currentUser;
    return user?.name || user?.email || 'Usuario';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToWelcome(): void {
    this.selectedChatId = null;
    this.welcomeRequested.emit();
  }

  toggleSidebar(): void {
    this.toggleRequested.emit();
  }

  ngOnInit(): void {
    this.loadChats();
    this.subscriptions.add(
      this.chatService.chatsRefreshRequested$.subscribe(() => {
        this.loadChats();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['minimized']) {
      console.log('Estado minimizado del sidebar cambió a:', this.minimized);
    }
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

  isSelected(chatId: string): boolean {
    return this.selectedChatId == chatId;
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
    this.selectedChatId = null;
    this.welcomeRequested.emit();
  }

}