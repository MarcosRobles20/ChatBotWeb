import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Token, marked } from 'marked';
import { MarkdownTableComponent } from '../table/markdown-table.component';
import { CodeBlockComponent } from '../code-block/code-block.component';
import { TextBlockComponent } from '../text-block/text-block.component';

@Component({
  selector: 'app-markdown-renderer',
  templateUrl: './markdown-renderer.component.html',
  standalone: true,
  imports: [CommonModule, MarkdownTableComponent, CodeBlockComponent, TextBlockComponent],
})
export class MarkdownRendererComponent {
  @Input() tokens: Token[] = [];
}
