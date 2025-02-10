import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PersonasService } from '../../services/personas.service';
import { CatPersonas } from '../../interfaces/CatPersonas';
import { ChatContainerComponent } from "../../../chatbot/components/chat-container/chat-container.component";
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '../../../chatbot/shared/shared.module';



@Component({
  selector: 'app-detalle-usuario',
  templateUrl: './detalle-usuario.component.html',
  styleUrl: './detalle-usuario.component.css',
  standalone: true,
  imports: [CommonModule, ChatContainerComponent, SharedModule]
})
export class DetalleUsuarioComponent implements OnInit {
  persona: CatPersonas = {} as CatPersonas;

  constructor(
    private route: ActivatedRoute,
    private personasService: PersonasService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.personasService.getPersonaPorId(Number(id)).subscribe(
      data => {
        this.persona = data;
        console.log('Persona cargada:', this.persona);
      },
      error => {
        console.error('Error al cargar persona', error);
      }
    );
  }
}
