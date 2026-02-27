
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { marked } from 'marked';
import hljs from 'highlight.js';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
    const renderer = new marked.Renderer();
    renderer.code = ({ text, lang, escaped }: { text: string, lang?: string, escaped?: boolean }) => {
      const language = (lang || '').split(/\s+/)[0];
      const langLabel = language ? language.toUpperCase() : '';
      let highlighted = '';
      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(text, { language }).value;
      } else {
        highlighted = hljs.highlightAuto(text).value;
      }
      // language header and copy button placeholder
      return `
        <div class="code-block-outer">
          <div class="code-block-header">
            <span class="code-lang">${langLabel}</span>
            <app-copy-button code="${encodeURIComponent(text)}"></app-copy-button>
          </div>
          <pre><code class="hljs language-${language}">${highlighted}</code></pre>
        </div>
      `;
    };
    marked.use({ renderer, breaks: true });
  }

  transform(value: string): any {
    if (!value) return [];
    const tokens = marked.lexer(value);
    // Post-procesar tokens para tablas y texto plano
    return tokens.map(token => {
      if (token.type === 'table') {
        // header: string[]
        const header = (token as any).header?.map((cell: any) => typeof cell === 'string' ? cell : (cell?.text || String(cell)));
        // rows: string[][]
        const rows = (token as any).rows?.map((row: any[]) => row.map(cell => typeof cell === 'string' ? cell : (cell?.text || String(cell))));
        return { ...token, header, rows };
      }
      if (token.type === 'paragraph' && typeof token.text !== 'string') {
        return { ...token, text: String(token.text) };
      }
      return token;
    });
  }

  /**
   * Convierte listas markdown anidadas en HTML con <ul> y <li> correctamente anidados.
   * Soporta hasta 3 niveles de indentación (puedes ampliar si lo necesitas).
   */
  private processNestedLists(text: string): string {
    const lines = text.split(/\r?\n/);
    let result: string[] = [];
    let stack: number[] = [];
    let lastIndent = 0;
    let listOpen = false;

    function openList() {
      result.push('<ul>');
      stack.push(1);
      listOpen = true;
    }
    function closeList() {
      result.push('</ul>');
      stack.pop();
      listOpen = stack.length > 0;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(\s*)([\-\*]) (.+)$/);
      if (match) {
        const indent = match[1].length;
        const content = match[3];

        if (!listOpen) openList();

        if (indent > lastIndent) {
          openList();
        } else if (indent < lastIndent) {
          while (stack.length > 1 && indent < lastIndent) {
            closeList();
            lastIndent -= 2;
          }
        }
        result.push(`<li>${content}</li>`);
        lastIndent = indent;
      } else {
        // Si hay una lista abierta y la línea no es un item, cerramos todas las listas
        while (stack.length > 0) {
          closeList();
        }
        result.push(line);
        lastIndent = 0;
      }
    }
    // Cerrar cualquier lista abierta al final
    while (stack.length > 0) {
      closeList();
    }
    return result.join('\n');
  }

  // ...existing code...

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
