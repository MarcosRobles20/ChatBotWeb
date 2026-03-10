import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardModule } from "@angular/material/card";

@Component({
  selector: 'app-mcp-event-viewer',
  templateUrl: './mcp-event-viewer.component.html',
  styleUrls: ['./mcp-event-viewer.component.css'],
  standalone: true,
  imports: [CommonModule, MatCardModule]
})
export class McpEventViewerComponent {
  @Input() chunk: any;
  objectKeys = Object.keys;
  key: any;

}
