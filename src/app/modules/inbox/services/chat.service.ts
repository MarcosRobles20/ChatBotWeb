import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Chat } from '../interfaces/chat.interface';
import { AuthService } from '../../../core/services/auth.service';
import { OllamaRequest } from '../../chatbot/interfaces/OllamaRequest.interface';
import { OllamaChatRequest } from '../../chatbot/interfaces/OllamaChatRequest.interface';
import { OllamaResponse } from '../../chatbot/interfaces/OllamaResponse.interface';
import { ModelsResponse } from '../../chatbot/interfaces/Models.interface';
import { StreamChunk } from '../../chatbot/interfaces/StreamChunk.interface';
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

  streamChat(request: OllamaChatRequest): Observable<StreamChunk> {
    return new Observable<StreamChunk>((observer) => {
      const token = this.authService.getToken();
      if (!token) {
        observer.error(new Error('No hay token de autenticación'));
        return;
      }

      const controller = new AbortController();
      let isClosed = false;
      let buffer = '';

      const completeOnce = (): void => {
        if (isClosed) return;
        isClosed = true;
        observer.complete();
      };

      const errorOnce = (error: unknown): void => {
        if (isClosed) return;
        isClosed = true;
        observer.error(error);
      };

      const emitChunk = (chunk: StreamChunk): boolean => {
        observer.next(chunk);

        if (chunk.type === 'error') {
          errorOnce(new Error(chunk.error || 'Error recibido en stream'));
          controller.abort();
          return false;
        }

        if (chunk.type === 'done') {
          completeOnce();
          controller.abort();
          return false;
        }

        return true;
      };

      const parseLine = (rawLine: string): boolean => {
        const line = rawLine.trim();
        if (!line || line === 'data:' || line.startsWith(':') || line.startsWith('event:')) {
          return true;
        }

        let payload = '';

        if (line.startsWith('data:')) {
          payload = line.slice(5).trim();
        } else if (line.startsWith('message')) {
          const firstBrace = line.indexOf('{');
          payload = firstBrace >= 0 ? line.slice(firstBrace).trim() : '';
        } else if (line.startsWith('{') && line.endsWith('}')) {
          payload = line;
        } else {
          return true;
        }

        if (!payload) return true;

        try {
          const chunk = JSON.parse(payload) as StreamChunk;
          return emitChunk(chunk);
        } catch {
          return true;
        }
      };

      const consumeBuffer = (): boolean => {
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const shouldContinue = parseLine(line);
          if (!shouldContinue) {
            return false;
          }
        }

        return true;
      };

      fetch(`${environment.apiUrl}/chat/chatStream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...request,
          stream: true
        }),
        signal: controller.signal
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }

          if (!response.body) {
            throw new Error('La respuesta no contiene body de streaming');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          const read = (): void => {
            reader.read()
              .then(({ done, value }) => {
                if (isClosed) return;

                if (done) {
                  if (buffer.trim().length > 0) {
                    parseLine(buffer.trim());
                  }
                  completeOnce();
                  return;
                }

                buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
                const shouldContinue = consumeBuffer();

                if (!shouldContinue || isClosed) {
                  return;
                }

                read();
              })
              .catch((err) => {
                if ((err as Error)?.name === 'AbortError') {
                  return;
                }
                errorOnce(err);
              });
          };

          read();
        })
        .catch((err) => {
          if ((err as Error)?.name === 'AbortError') {
            return;
          }
          errorOnce(err);
        });

      return () => {
        controller.abort();
      };
    });
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