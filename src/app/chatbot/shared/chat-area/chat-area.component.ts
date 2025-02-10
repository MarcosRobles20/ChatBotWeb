import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Chatbot } from '../../interfaces/Chatbot.interface';
import { Message } from '../../interfaces/Message.interface';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.css']
})
export class ChatAreaComponent {
  @Input() messages: Message[] = [];

  trackByTimestamp(index: number, message: Message): number {
    return message.timestamp;
  }

}