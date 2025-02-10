import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-send-button',
  imports: [
    CommonModule, 
    MatIconModule],
  templateUrl: './send-button.component.html',
  styleUrl: './send-button.component.css',
  standalone: true
})
export class SendButtonComponent {
  @Output() click = new EventEmitter<void>();

  onClick(): void {
    this.click.emit();
  }

}
