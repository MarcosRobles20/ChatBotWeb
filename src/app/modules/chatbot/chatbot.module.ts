import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatAreaComponent } from './components/chat-area/chat-area.component';
import { InputFieldComponent } from './components/input-field/input-field.component';
import { SendButtonComponent } from './components/send-button/send-button.component';
import { ChatContainerComponent } from './components/chat-container/chat-container.component';

@NgModule({
  imports: [
    CommonModule,
    ChatAreaComponent,
    InputFieldComponent,
    SendButtonComponent,
    ChatContainerComponent
  ],
  exports: [
    ChatAreaComponent,
    InputFieldComponent,
    SendButtonComponent,
    ChatContainerComponent
  ]
})
export class ChatbotModule { }