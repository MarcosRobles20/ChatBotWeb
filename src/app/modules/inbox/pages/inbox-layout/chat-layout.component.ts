import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
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
    ChatSidebarComponent
  ],
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.css']
})
export class ChatLayoutComponent implements OnInit, AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  selectedChat: Chat | null = null;
  sidenavMinimized = false;
  currentUser: User | null = null;
  isInitialLoad = true;
  private readonly SIDEBAR_STATE_KEY = 'sidenavMinimized';
  private readonly draftChat: Chat = {
    idChat: 'new',
    idUser: '',
    title: 'Nuevo Chat',
    message: null,
    lastModified: new Date().toISOString(),
    messages: [],
    totalMessages: 0,
    maxMessages: 100,
    success: true
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    // NO cargar el estado aquí, esperar a AfterViewInit
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngAfterViewInit(): void {
    // Cargar el estado del sidebar DESPUÉS de que la vista esté inicializada
    const savedState = localStorage.getItem(this.SIDEBAR_STATE_KEY);
    if (savedState !== null) {
      // Primero establecer el estado sin transiciones
      this.sidenavMinimized = savedState === 'true';
      this.cdr.detectChanges();
      
      // Después permitir transiciones
      setTimeout(() => {
        this.isInitialLoad = false;
        this.cdr.detectChanges();
        console.log('Estado del sidebar cargado desde localStorage:', this.sidenavMinimized);
      }, 50);
    } else {
      setTimeout(() => {
        this.isInitialLoad = false;
        this.cdr.detectChanges();
      }, 50);
    }
  }

  onChatSelected(chat: Chat): void {
    this.selectedChat = chat;
    console.log('Chat seleccionado:', chat);
    
    this.router.navigate(['/inbox/chat', chat.idChat]);
  }

  onWelcomeRequested(): void {
    this.selectedChat = this.draftChat;
    this.router.navigate(['/inbox/chat/new']);
  }

  toggleSidenav(): void {
    this.sidenavMinimized = !this.sidenavMinimized;
    // Guardar el estado en localStorage
    localStorage.setItem(this.SIDEBAR_STATE_KEY, this.sidenavMinimized.toString());
    console.log('Estado sidebar guardado:', this.sidenavMinimized);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get selectedChatId(): string | null {
    return this.selectedChat?.idChat || null;
  }

  get sidenavWidth(): number {
    return this.sidenavMinimized ? 80 : 280;
  }
}