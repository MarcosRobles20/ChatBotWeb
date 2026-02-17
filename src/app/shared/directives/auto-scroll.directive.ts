import { Directive, ElementRef, Input, AfterViewChecked, OnChanges, SimpleChanges, DoCheck } from '@angular/core';

@Directive({
  selector: '[appAutoScroll]',
  standalone: true
})
export class AutoScrollDirective implements AfterViewChecked, OnChanges, DoCheck {
  @Input('appAutoScroll') enabled: boolean = true;
  @Input() messages: any[] = [];
  
  private lastMessageCount = 0;
  private shouldScroll = false;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      this.checkForNewMessages();
    }
  }

  ngDoCheck(): void {
    // Detecta cambios incluso cuando se muta el array con push()
    this.checkForNewMessages();
  }

  private checkForNewMessages(): void {
    if (this.messages && this.messages.length > this.lastMessageCount) {
      this.shouldScroll = true;
      this.lastMessageCount = this.messages.length;
    }
  }

  ngAfterViewChecked(): void {
    if (this.enabled && this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.elementRef.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }
}
