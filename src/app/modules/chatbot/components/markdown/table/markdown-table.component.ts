
import { Component, Input } from '@angular/core';
import { marked } from 'marked';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-markdown-table',
  templateUrl: './markdown-table.component.html',
  styleUrls: ['./markdown-table.component.scss'],
  standalone: true,
  imports: [CommonModule]
})

export class MarkdownTableComponent {
  @Input() header: string[] = [];
  @Input() rows: string[][] = [];
  public marked = marked;
}
