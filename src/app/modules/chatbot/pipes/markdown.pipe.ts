import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    let html = value;

    // Escapar HTML para evitar XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Títulos (#### a # — orden de mayor a menor especificidad)
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Negrita (**texto** o __texto__)
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Cursiva (*texto* o _texto_)
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Código en línea (`código`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bloques de código (```código```)
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

    // Línea horizontal (--- o *** o ___)
    html = html.replace(/^\s*(---+|\*\*\*+|___+)\s*$/gim, '<hr>');

    // Sub-items con sangría (  - item o   * item)
    html = html.replace(/^ {1,}[\-\*] (.+)$/gim, '<li class="sub-item">$1</li>');

    // Listas desordenadas principales (* item o - item al inicio)
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^\- (.+)$/gim, '<ul>$1</ul>');

    // Envolver cada grupo consecutivo de <li> en <ul>
    html = html.replace(/((?:<li[^>]*>.*?<\/li>(\n|$))+)/g, '<ul>\n$1</ul>\n');

    // Tablas markdown (| col1 | col2 |)
    html = this.processTables(html);

    // Saltos de línea dobles = párrafos
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Saltos de línea simples
    html = html.replace(/\n/g, '<br>');

    return this.sanitizer.sanitize(1, html) || '';
  }

  private processTables(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Detectar si es una línea de tabla (contiene | al inicio y fin)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        
        // Recoger todas las líneas de la tabla
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        
        if (tableLines.length >= 2) {
          result.push(this.convertTableToHtml(tableLines));
        } else {
          result.push(...tableLines);
        }
      } else {
        result.push(line);
        i++;
      }
    }
    
    return result.join('\n');
  }

  private convertTableToHtml(tableLines: string[]): string {
    let html = '<table>';
    
    // Primera línea es el header
    const headerCells = tableLines[0].split('|').filter(cell => cell.trim());
    html += '<thead><tr>';
    headerCells.forEach(cell => {
      html += `<th>${cell.trim()}</th>`;
    });
    html += '</tr></thead>';
    
    // Segunda línea es el separador (ignorar)
    // Resto son filas de datos
    if (tableLines.length > 2) {
      html += '<tbody>';
      for (let i = 2; i < tableLines.length; i++) {
        const cells = tableLines[i].split('|').filter(cell => cell.trim());
        html += '<tr>';
        cells.forEach(cell => {
          html += `<td>${cell.trim()}</td>`;
        });
        html += '</tr>';
      }
      html += '</tbody>';
    }
    
    html += '</table>';
    return html;
  }
}
