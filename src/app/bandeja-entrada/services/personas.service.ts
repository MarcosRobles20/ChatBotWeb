import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private apiUrl = 'https://localhost:7011/api/Persona';

  constructor(private http: HttpClient) { }

  cargarPersonas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/CargarPersonas`);
  }

  getPersonaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/CargarPersona/${id}`);
  }
}