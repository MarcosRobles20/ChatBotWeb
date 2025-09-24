import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Chat } from '../interfaces/chat.interface';


const apiCatalog = {
  chat: '/Chat',
  
}
@Injectable({
  providedIn: 'root'
})

export class ChatService {
  constructor(private http: HttpClient) { }

  getChatsWithIdUser(idUser: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl + apiCatalog.chat}/getChatsWithIdUser`, idUser);
  }

  getChatWithIdChat(idChat: number, idUser: number): Observable<any> {
    const payload = 
    {
      idChat,
      idUser
    }
    return this.http.post<any>(`${environment.apiUrl + apiCatalog.chat}/getChatWithIdChat`, payload);
  }
}