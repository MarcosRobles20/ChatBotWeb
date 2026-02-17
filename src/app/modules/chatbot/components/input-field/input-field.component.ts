import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../../shared.module';
import { ModelSelectorComponent } from '../model-selector/model-selector.component';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, TextFieldModule, MatIconModule, MatButtonModule, ModelSelectorComponent, SharedModule],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.css',
  standalone: true
})
export class InputFieldComponent {
  @Output() messageChange = new EventEmitter<string>();
  @Output() sendMessage = new EventEmitter<void>();
  @Output() modelChange = new EventEmitter<string>();
  
  @Input() message: string = '';
  @Input() disabled: boolean = false;
  @Input() selectedModel: string = 'mistral:latest';

  onInput(): void {
    this.messageChange.emit(this.message);
  }

  onEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    // Si se presiona Enter sin Shift, enviar mensaje (solo si no está disabled y hay contenido)
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      // Solo enviar si no está deshabilitado y hay mensaje
      if (!this.disabled && this.message.trim()) {
        this.onSendClick();
      }
    }
    // Shift+Enter permite saltos de línea (comportamiento por defecto)
  }

  onSendClick(): void {
    if (!this.disabled && this.message.trim()) {
      this.sendMessage.emit();
    }
  }

  onModelChange(model: string): void {
    this.modelChange.emit(model);
  }
}
