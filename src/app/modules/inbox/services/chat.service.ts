import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Chat } from '../interfaces/chat.interface';
import { AuthService } from '../../../core/services/auth.service';
import { OllamaRequest } from '../../chatbot/interfaces/OllamaRequest.interface';
import { ChatMessageItem, OllamaChatRequest } from '../../chatbot/interfaces/OllamaChatRequest.interface';
import { OllamaResponse } from '../../chatbot/interfaces/OllamaResponse.interface';
import { ModelsResponse } from '../../chatbot/interfaces/Models.interface';
const apiCatalog = {
  chat: '/Chat',
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messages: any[] = [];
  currentMessageIndex: number = -1;
  private chatsRefreshRequestedSubject = new Subject<void>();
  chatsRefreshRequested$ = this.chatsRefreshRequestedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Métodos auxiliares para el seguimiento de mensajes
  updateMessages(messages: any[]): void {
    this.messages = messages;
    this.currentMessageIndex = messages.length - 1;
  }

  addMessage(message: any): void {
    this.messages.push(message);
    this.currentMessageIndex = this.messages.length - 1;
  }

  requestChatsRefresh(): void {
    this.chatsRefreshRequestedSubject.next();
  }

  getChatsWithIdUser(): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    const idUser = currentUser?.idUser;
    
    if (!idUser) {
      throw new Error('No hay usuario logueado');
    }
    const payload = { 
      IdUser: idUser.toString()
    };
    
    return this.http.post<any>(`${environment.apiUrl + apiCatalog.chat}/getChatsWithIdUser`, payload);
  }

  getChatWithIdChat(idChat: string): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    const idUser = currentUser?.idUser;
    
    if (!idUser) {
      throw new Error('No hay usuario logueado');
    }
    
    const payload = { 
      IdChat: idChat.toString(),
      IdUser: idUser.toString()
    };
    
    return this.http.post<any>(`${environment.apiUrl + apiCatalog.chat}/getChatWithIdChat`, payload);
  }

  createChat(chat: Chat): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl + apiCatalog.chat}/createChat`, chat);
  }

  sendMessage(ollamaRequest: OllamaRequest): Observable<OllamaResponse> {
    return this.http.post<OllamaResponse>(`${environment.apiUrl + apiCatalog.chat}/generate`, ollamaRequest);
  }

  getModels(): Observable<ModelsResponse> {
    return this.http.get<ModelsResponse>(`${environment.apiUrl + apiCatalog.chat}/models`);
  }

  sendMessageStream(ollamaRequest: OllamaRequest): Observable<OllamaResponse> {
    return this.http.post<OllamaResponse>(`${environment.apiUrl + apiCatalog.chat}/generateOllamaSharp`, ollamaRequest);
  } 

  sendMessageWithContextChat(ollamaChatRequest: OllamaChatRequest): Observable<OllamaResponse> {
    return this.http.post<OllamaResponse>(`${environment.apiUrl + apiCatalog.chat}/chatWithMemory`, ollamaChatRequest);
  }

  
  getChatMessages(idChat: string): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    const idUser = currentUser?.idUser;
    
    if (!idUser) {
      throw new Error('No hay usuario logueado');
    }
    
    const payload = { 
      IdChat: idChat.toString(),
      IdUser: idUser.toString()
    };
    
    return this.http.post<any>(`${environment.apiUrl + apiCatalog.chat}/getChatMessages`, payload);
  }

}