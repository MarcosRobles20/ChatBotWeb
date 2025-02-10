import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SendButtonComponent } from '../../shared/send-button/send-button.component';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { ChatAreaComponent } from '../../shared/chat-area/chat-area.component';
import { SharedModule } from '../../shared/shared.module';
import { DetalleUsuarioComponent } from "../../../bandeja-entrada/pages/detalle-usuario/detalle-usuario.component";
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
        timestamp: Date.now()
      };
      this.messages.push(newMessage);
      this.message = ''; // Limpiar el campo de entrada después de enviar el mensaje
    }
  }

}
