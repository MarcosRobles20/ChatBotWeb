# Auto-Scroll Feature - Documentación Técnica

## 📋 Descripción General

Sistema de desplazamiento automático que mueve el contenedor de mensajes hacia abajo cuando se cargan mensajes iniciales o se agregan nuevos mensajes durante la conversación. Implementado con una directiva Angular standalone reutilizable.

---

## 🏗️ Arquitectura

### Componentes Involucrados

```
src/app/
├── shared/
│   └── directives/
│       ├── auto-scroll.directive.ts       (Directiva principal)
│       └── auto-scroll.directive.spec.ts  (Tests)
│
└── modules/
    └── chatbot/
        └── components/
            ├── chat-area/
            │   ├── chat-area.component.ts      (Uso de la directiva)
            │   ├── chat-area.component.html    (Aplicación en template)
            │   └── chat-area.component.css     (Estilos necesarios)
            │
            └── chat-container/
                └── chat-container.component.ts (Gestión de mensajes)
```

---

## 🔧 Implementación Detallada

### 1. Directiva AutoScroll

**Ubicación**: `src/app/shared/directives/auto-scroll.directive.ts`

#### Funcionalidad Principal

```typescript
@Directive({
  selector: '[appAutoScroll]',
  standalone: true
})
export class AutoScrollDirective implements AfterViewChecked, OnChanges, DoCheck
```

#### Ciclos de Vida Utilizados

| Hook | Propósito |
|------|-----------|
| `ngOnChanges` | Detecta cuando la referencia del array de mensajes cambia completamente |
| `ngDoCheck` | Detecta mutaciones en el array (push, splice, etc.) |
| `ngAfterViewChecked` | Ejecuta el scroll después de que el DOM se actualiza |

#### Propiedades

```typescript
@Input('appAutoScroll') enabled: boolean = true;  // Habilitar/deshabilitar
@Input() messages: any[] = [];                    // Array de mensajes a observar

private lastMessageCount = 0;      // Contador de mensajes previos
private shouldScroll = false;      // Flag para ejecutar scroll
```

#### Lógica de Detección

```typescript
private checkForNewMessages(): void {
  if (this.messages && this.messages.length > this.lastMessageCount) {
    this.shouldScroll = true;
    this.lastMessageCount = this.messages.length;
  }
}
```

**¿Por qué DoCheck?**: Angular no detecta automáticamente cuando se modifica un array con `push()` o `splice()`. `DoCheck` se ejecuta en cada ciclo de detección de cambios, permitiendo comparar la longitud actual vs. la anterior.

#### Método de Scroll

```typescript
private scrollToBottom(): void {
  try {
    const element = this.elementRef.nativeElement;
    element.scrollTop = element.scrollHeight;
  } catch (err) {
    console.error('Error al hacer scroll:', err);
  }
}
```

---

### 2. Componente ChatArea

**Uso de la Directiva**

#### TypeScript (`chat-area.component.ts`)

```typescript
import { AutoScrollDirective } from '../../../../shared/directives/auto-scroll.directive';

@Component({
  imports: [CommonModule, MatCardModule, MarkdownPipe, AutoScrollDirective],
  // ...
})
export class ChatAreaComponent {
  @Input() messages: Message[] = [];
}
```

#### Template (`chat-area.component.html`)

```html
<div class="messages" 
     #messageContainer 
     [appAutoScroll]="true" 
     [messages]="messages">
  <!-- Mensajes renderizados aquí -->
</div>
```

#### CSS Requerido (`chat-area.component.css`)

```css
.messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(100vh - 250px);  /* ⚠️ CRÍTICO: Altura máxima */
  overflow-y: auto;                  /* ⚠️ CRÍTICO: Scroll visible */
  scroll-behavior: smooth;           /* ✨ Scroll suave */
}
```

**⚠️ IMPORTANTE**: Sin `max-height` y `overflow-y: auto`, el contenedor crecerá infinitamente y no habrá scroll.

---

### 3. Gestión de Mensajes

#### Componente ChatContainer

**❌ INCORRECTO - No detecta cambios**

```typescript
// Esto NO dispara ngOnChanges porque la referencia del array no cambia
this.messagesArray.push(userMessage);
this.messagesArray.push(botMessage);
```

**✅ CORRECTO - Crea nueva referencia**

```typescript
// Crear nuevo array con spread operator
this.messagesArray = [...this.messagesArray, userMessage];
this.messagesArray = [...this.messagesArray, botMessage];
```

**¿Por qué funciona?**: El spread operator (`...`) crea un **nuevo array** con una referencia diferente, lo que permite que Angular detecte el cambio en `ngOnChanges`.

#### Implementación en handleSend()

```typescript
handleSend(): void {
  // 1. Agregar mensaje del usuario
  const userMessage: Message = {
    content: text,
    isUser: true,
    role: 'user',
    timestamp: Date.now().toString()
  };
  // ✅ Spread operator crea nuevo array
  this.messagesArray = [...this.messagesArray, userMessage];

  // 2. Enviar al backend
  this.chatService.sendMessageWithContextChat(payload).subscribe({
    next: (response) => {
      const botMessage: Message = {
        content: response.aiResponse,
        isUser: false,
        role: 'assistant',
        timestamp: response.timestamp
      };
      // ✅ Nuevo array para respuesta del bot
      this.messagesArray = [...this.messagesArray, botMessage];
    }
  });
}
```

---

## 🎯 Flujo de Ejecución

```
1. Usuario envía mensaje
   ↓
2. ChatContainer agrega mensaje al array con spread operator
   this.messagesArray = [...this.messagesArray, newMessage]
   ↓
3. Angular detecta cambio de referencia del array
   ↓
4. AutoScrollDirective.ngOnChanges() se dispara
   ↓
5. checkForNewMessages() compara longitudes
   messages.length > lastMessageCount
   ↓
6. Establece shouldScroll = true
   ↓
7. ngAfterViewChecked() detecta shouldScroll
   ↓
8. scrollToBottom() ejecuta el scroll
   element.scrollTop = element.scrollHeight
   ↓
9. Usuario ve el nuevo mensaje en pantalla
```

---

## 🔄 ChatService - Tracking de Mensajes

**Ubicación**: `src/app/modules/inbox/services/chat.service.ts`

```typescript
export class ChatService {
  messages: any[] = [];
  currentMessageIndex: number = -1;

  // Actualizar todo el array de mensajes (carga inicial)
  updateMessages(messages: any[]): void {
    this.messages = messages;
    this.currentMessageIndex = messages.length - 1;
  }

  // Agregar un mensaje individual
  addMessage(message: any): void {
    this.messages.push(message);
    this.currentMessageIndex = this.messages.length - 1;
  }
}
```

**Nota**: Estas propiedades están disponibles para uso futuro si se necesita un estado centralizado de mensajes.

---

## 🧪 Testing

**Archivo**: `src/app/shared/directives/auto-scroll.directive.spec.ts`

### Tests Implementados

1. ✅ **Creación de instancia**: Verifica que la directiva se inicializa correctamente
2. ✅ **Scroll con nuevos mensajes**: Confirma que `scrollTop` aumenta cuando se agregan mensajes
3. ✅ **Deshabilitar scroll**: Verifica que `enabled=false` previene el scroll

### Ejecutar Tests

```bash
# Todos los tests
ng test

# Solo directiva auto-scroll
ng test --include='**/auto-scroll.directive.spec.ts'
```

---

## 🎨 Personalización y Configuración

### Deshabilitar Auto-Scroll Temporalmente

```html
<!-- En el template -->
<div [appAutoScroll]="enableAutoScroll" [messages]="messages">
```

```typescript
// En el componente
export class MiComponente {
  enableAutoScroll = true;

  toggleAutoScroll() {
    this.enableAutoScroll = !this.enableAutoScroll;
  }
}
```

### Cambiar Velocidad de Scroll

```css
.messages {
  /* Scroll instantáneo */
  scroll-behavior: auto;

  /* Scroll suave (default) */
  scroll-behavior: smooth;
}
```

### Agregar Delay al Scroll

```typescript
private scrollToBottom(): void {
  setTimeout(() => {
    try {
      const element = this.elementRef.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }, 100); // 100ms de delay
}
```

### Scroll Animado con Smooth Behavior

```typescript
private scrollToBottom(): void {
  try {
    const element = this.elementRef.nativeElement;
    element.scroll({
      top: element.scrollHeight,
      behavior: 'smooth'
    });
  } catch (err) {
    console.error('Error al hacer scroll:', err);
  }
}
```

---

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: El scroll no funciona

**Síntomas**: La directiva está aplicada pero no hace scroll

**Causas Posibles**:

1. ❌ Falta `overflow-y: auto` en el contenedor
   ```css
   .messages {
     overflow-y: auto; /* ✅ Agregar esto */
   }
   ```

2. ❌ No hay `max-height` definida
   ```css
   .messages {
     max-height: 500px; /* ✅ Definir altura máxima */
   }
   ```

3. ❌ Modificando array con push() en lugar de spread
   ```typescript
   // ❌ Mal
   this.messages.push(newMsg);
   
   // ✅ Bien
   this.messages = [...this.messages, newMsg];
   ```

### Problema 2: El scroll funciona en carga inicial pero no en nuevos mensajes

**Causa**: Mutación directa del array sin crear nueva referencia

**Solución**: Usar spread operator siempre
```typescript
// Siempre crear nueva referencia
this.messagesArray = [...this.messagesArray, newMessage];
```

### Problema 3: Scroll muy frecuente o performance issues

**Causa**: `ngDoCheck` se ejecuta muy frecuentemente

**Solución 1**: Usar trackBy en ngFor
```html
<ng-container *ngFor="let msg of messages; trackBy: trackByTimestamp">
```

```typescript
trackByTimestamp(index: number, message: Message): string {
  return message.timestamp;
}
```

**Solución 2**: Debounce en la directiva
```typescript
private scrollTimeout: any;

private scrollToBottom(): void {
  if (this.scrollTimeout) {
    clearTimeout(this.scrollTimeout);
  }
  
  this.scrollTimeout = setTimeout(() => {
    try {
      const element = this.elementRef.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }, 50);
}
```

### Problema 4: Scroll interrumpe cuando el usuario está leyendo arriba

**Solución**: Detectar posición del usuario antes de hacer scroll

```typescript
private scrollToBottom(): void {
  try {
    const element = this.elementRef.nativeElement;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    
    // Solo hacer scroll si el usuario está cerca del final
    if (isNearBottom) {
      element.scrollTop = element.scrollHeight;
    }
  } catch (err) {
    console.error('Error al hacer scroll:', err);
  }
}
```

---

## 🚀 Mejoras Futuras Sugeridas

### 1. Botón "Ir al final"

Mostrar un botón flotante cuando el usuario se aleja del final:

```typescript
@HostListener('scroll', ['$event'])
onScroll(event: Event): void {
  const element = event.target as HTMLElement;
  const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
  this.showScrollButton = !isAtBottom;
}
```

### 2. Indicador de nuevos mensajes

Mostrar contador cuando hay mensajes sin leer abajo:

```typescript
private unreadCount = 0;

private checkForNewMessages(): void {
  if (this.messages && this.messages.length > this.lastMessageCount) {
    if (!this.isUserAtBottom()) {
      this.unreadCount += (this.messages.length - this.lastMessageCount);
    }
    // ...
  }
}
```

### 3. Scroll suave solo en desktop

```typescript
private scrollToBottom(): void {
  const isMobile = window.innerWidth < 768;
  this.element.scroll({
    top: this.element.scrollHeight,
    behavior: isMobile ? 'auto' : 'smooth'
  });
}
```

### 4. Scroll con offset para mejor UX

```typescript
private scrollToBottom(): void {
  const element = this.elementRef.nativeElement;
  const offset = 20; // 20px de padding inferior
  element.scrollTop = element.scrollHeight - element.clientHeight + offset;
}
```

---

## 📊 Consideraciones de Performance

### Optimizaciones Implementadas

1. ✅ **Flag shouldScroll**: Evita scrolls innecesarios
2. ✅ **TrackBy en ngFor**: Reduce re-renderizado de mensajes
3. ✅ **Standalone directive**: Mejor tree-shaking

### Métricas Estimadas

- **Overhead por mensaje**: ~0.5ms
- **Tiempo de scroll**: 200-300ms (smooth)
- **Memoria adicional**: ~1KB por instancia de directiva

---

## 📚 Referencias y Recursos

### Documentación Angular

- [Lifecycle Hooks](https://angular.io/guide/lifecycle-hooks)
- [DoCheck Hook](https://angular.io/api/core/DoCheck)
- [Directives](https://angular.io/guide/attribute-directives)

### APIs Web Utilizadas

- [Element.scrollTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop)
- [Element.scrollHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight)
- [scroll-behavior CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior)

---

## 🔐 Checklist de Implementación

Para implementar auto-scroll en un nuevo componente:

- [ ] Importar `AutoScrollDirective` en el componente
- [ ] Agregar CSS: `overflow-y: auto` y `max-height`
- [ ] Aplicar directiva: `[appAutoScroll]="true" [messages]="messages"`
- [ ] Usar spread operator al modificar mensajes: `arr = [...arr, newMsg]`
- [ ] Agregar `trackBy` en `*ngFor`
- [ ] Verificar en navegador que funciona
- [ ] Probar con múltiples mensajes seguidos
- [ ] Verificar comportamiento en mobile

---

## 📝 Historial de Cambios

### v1.0.0 - Feb 10, 2026

- ✅ Implementación inicial de `AutoScrollDirective`
- ✅ Integración con `ChatAreaComponent`
- ✅ Soporte para detección con `DoCheck`
- ✅ Tests unitarios básicos
- ✅ CSS con `scroll-behavior: smooth`
- ✅ Uso de spread operator en `ChatContainer`

---

## 👥 Mantenimiento

**Responsable**: Equipo de Frontend  
**Última Actualización**: Febrero 10, 2026  
**Próxima Revisión**: Marzo 2026  

Para dudas o mejoras, crear issue en el repositorio con etiqueta `auto-scroll`.
