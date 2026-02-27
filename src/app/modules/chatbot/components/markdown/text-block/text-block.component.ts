import { Component, Input } from '@angular/core';

import { marked } from 'marked';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-block.component.html',
  styleUrls: ['./text-block.component.scss']
  
})
export class TextBlockComponent {
  @Input() token: any;
  public marked = marked;
}
