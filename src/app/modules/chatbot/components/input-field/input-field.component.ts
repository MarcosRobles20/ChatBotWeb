import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, SharedModule],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.css',
  standalone: true
})
export class InputFieldComponent {
  @Output() input = new EventEmitter<string>();
  message: string = '';

  onInput(): void {
    this.input.emit(this.message);
  }
}
