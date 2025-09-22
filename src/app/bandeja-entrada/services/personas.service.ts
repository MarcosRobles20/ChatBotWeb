import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


const apiCatalog = {
  persona: '/Persona',
  
}
@Injectable({
  providedIn: 'root'
})

export class PersonasService {
  private apiUrl = 'https://localhost:7011/api/Persona';

  constructor(private http: HttpClient) { }

  cargarPersonas(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl + apiCatalog.persona}/CargarPersonas`);
  }

  getPersonaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl + apiCatalog.persona}/CargarPersona/${id}`);
  }
}