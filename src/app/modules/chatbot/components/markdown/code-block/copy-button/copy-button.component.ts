import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-copy-button',
  styleUrls: ['./copy-button.component.css'],
  standalone: true,
  imports: [CommonModule],
  templateUrl: './copy-button.component.html',

})
export class CopyButtonComponent {
  @Input() code = '';
  copied = false;

  copy() {
    navigator.clipboard.writeText(this.code);
    this.copied = true;
    setTimeout(() => this.copied = false, 1200);
  }
}
