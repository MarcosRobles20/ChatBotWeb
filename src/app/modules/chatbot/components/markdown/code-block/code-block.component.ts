import { Component, Input } from '@angular/core';
import hljs from 'highlight.js';

@Component({
  selector: 'app-code-block',
  templateUrl: './code-block.component.html',
  styleUrls: ['./code-block.component.scss']
})
export class CodeBlockComponent {
  @Input() code = '';
  @Input() language = '';
  copied = false;
  highlightedCode = '';

  ngOnChanges() {
    this.highlightedCode = this.language && hljs.getLanguage(this.language)
      ? hljs.highlight(this.code, { language: this.language }).value
      : hljs.highlightAuto(this.code).value;
  }

  copyCode() {
    navigator.clipboard.writeText(this.code);
    this.copied = true;
    setTimeout(() => this.copied = false, 1200);
  }
}
