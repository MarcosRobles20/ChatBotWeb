import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Chat } from '../interfaces/chat.interface';
import { AuthService } from '../../../core/services/auth.service';

const apiCatalog = {
  chat: '/Chat',
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

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

  getChatWithIdChat(idChat: number): Observable<any> {
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
}