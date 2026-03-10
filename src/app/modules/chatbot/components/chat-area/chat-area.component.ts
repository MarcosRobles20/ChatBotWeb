import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Message } from '../../interfaces/Message.interface';
import { AutoScrollDirective } from '../../../../shared/directives/auto-scroll.directive';
import { MarkdownPipe } from '../markdown/pipes/markdown.pipe';
import { CopyButtonComponent } from '../markdown/code-block/copy-button/copy-button.component';
import { MarkdownRendererComponent } from '../markdown/renderer/markdown-renderer.component';
import { CodeBlockComponent } from '../markdown/code-block/code-block.component';
import { McpEventViewerComponent } from '../mcp-event-viewer/mcp-event-viewer.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [CommonModule, MatCardModule, MarkdownPipe, AutoScrollDirective, MarkdownRendererComponent],
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.css']
})
export class ChatAreaComponent {
  @Input() messages: Message[] = [];
  @Input() mcpChunks: any[] = [];
  @Output() thinkingToggle = new EventEmitter<string>();
  @Input() showAllReferences: { [timestamp: string]: boolean } = {};
  @Input() isDarkTheme: boolean = false;
  apiPythonUrl: string = environment.apiPythonUrl;

  trackByTimestamp(index: number, message: Message): string {
    return message.timestamp;
  }

  onToggleThinking(timestamp: string): void {
    this.thinkingToggle.emit(timestamp);
  }

  parsedReferences(message: any): any[] {
    if (message.kind === 'references' && typeof message.content === 'string') {
      try {
        return JSON.parse(message.content);
      } catch {
        return [];
      }
    }
    return message.references || [];
  }
  expandedReferences: { [timestamp: string]: boolean } = {};

  toggleReferences(timestamp: string): void {
    this.expandedReferences[timestamp] = !this.expandedReferences[timestamp];
  }

}