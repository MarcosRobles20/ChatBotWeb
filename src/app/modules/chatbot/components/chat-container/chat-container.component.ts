import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SendButtonComponent } from '../send-button/send-button.component';
import { InputFieldComponent } from '../input-field/input-field.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { SharedModule } from '../../shared.module';
import { Message } from '../../interfaces/Message.interface';

@Component({
  selector: 'app-chat-container',
  imports: [CommonModule, ChatAreaComponent, InputFieldComponent, SendButtonComponent, SharedModule],
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.css',
  standalone: true
})
export class ChatContainerComponent {
  messages: Message[] = [];
  message: string = '';

  handleInput(event: string): void {
    this.message = event;
  }

  handleSend(): void {
    console.log('Mensaje enviado:', this.message);
    if (this.message.trim()) {
      const newMessage: Message = {
        content: this.message,
        isUser: true,
        role: 'user',
        timestamp: Date.now()
      };
      this.messages.push(newMessage);
      this.message = ''; // Limpiar el campo de entrada después de enviar el mensaje
    }
  }

}
