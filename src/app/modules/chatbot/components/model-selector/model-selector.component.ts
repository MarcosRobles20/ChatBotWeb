import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../inbox/services/chat.service';
import { ModelInfo } from '../../interfaces/Models.interface';

@Component({
  selector: 'app-model-selector',
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, FormsModule],
  templateUrl: './model-selector.component.html',
  styleUrl: './model-selector.component.css'
})
export class ModelSelectorComponent implements OnInit {
  @Input() selectedModel: string = 'mistral:latest';
  @Input() disabled: boolean = false;
  @Output() modelChange = new EventEmitter<string>();

  availableModels: ModelInfo[] = [];
  isLoading = true;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.isLoading = true;
    this.chatService.getModels().subscribe({
      next: (response) => {
        console.log('Modelos disponibles:', response);
        if (response.success && response.models && Array.isArray(response.models)) {
          this.availableModels = response.models;
          // Si el modelo seleccionado actual no está en la lista, selecciona el primero
          if (this.availableModels.length > 0 && 
              !this.availableModels.find(m => m.name === this.selectedModel)) {
            this.selectedModel = this.availableModels[0].name;
            this.modelChange.emit(this.selectedModel);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar modelos:', error);
        this.isLoading = false;
        // Fallback con modelos por defecto si falla la API
        this.availableModels = [
          { name: 'mistral:latest', model: 'mistral:latest', modified_at: '', size: 0, digest: '', details: {} as any }
        ];
      }
    });
  }

  onModelChange(): void {
    this.modelChange.emit(this.selectedModel);
  }

  // Método helper para formatear el tamaño del modelo
  formatSize(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  }
}
