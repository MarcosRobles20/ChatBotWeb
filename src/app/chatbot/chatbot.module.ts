import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatAreaComponent } from './shared/chat-area/chat-area.component';
import { InputFieldComponent } from './shared/input-field/input-field.component';
import { SendButtonComponent } from './shared/send-button/send-button.component';

@NgModule({
  imports: [
    CommonModule,
    ChatAreaComponent,
    InputFieldComponent,
    SendButtonComponent,
    
  ],
  exports: [
    ChatAreaComponent,
    InputFieldComponent,
    SendButtonComponent
  ]
})
export class ChatbotModule { }