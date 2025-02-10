import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PersonasService } from '../services/personas.service';
import { CatPersonas } from '../interfaces/CatPersonas';
import { Router } from '@angular/router';
import { SharedModule } from '../../chatbot/shared/shared.module';

@Component({
  selector: 'app-bandeja-entrada-usuarios',
  templateUrl: './bandeja-entrada-usuarios.component.html',
  styleUrls: ['./bandeja-entrada-usuarios.component.scss'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, SharedModule]
})
export class BandejaEntradaUsuariosComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nombre', 'email','fechaRegistro','acciones'];
  personas: CatPersonas[] = [];
  route: any;

  constructor(private personasService: PersonasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarPersonas();
  }

  cargarPersonas(): void {
    this.personasService.cargarPersonas().subscribe(
      data => {
        this.personas = data.response;
        console.log('Personas cargadas:', this.personas);
      },
      error => {
        console.error('Error al cargar personas', error);
      }
    );
  }

  verDetalles(id: number): void {
    this.router.navigate(['/detalle-usuario', id]);
  }
}