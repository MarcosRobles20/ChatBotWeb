import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { AutoScrollDirective } from './auto-scroll.directive';

describe('AutoScrollDirective', () => {
  it('should create an instance', () => {
    const elementRef = new ElementRef(document.createElement('div'));
    const directive = new AutoScrollDirective(elementRef);
    expect(directive).toBeTruthy();
  });

  it('should scroll to bottom when new messages are added', () => {
    const mockElement = document.createElement('div');
    mockElement.style.height = '100px';
    mockElement.style.overflow = 'auto';
    
    const elementRef = new ElementRef(mockElement);
    const directive = new AutoScrollDirective(elementRef);

    // Simular contenido que excede el tamaño del contenedor
    const content = document.createElement('div');
    content.style.height = '500px';
    mockElement.appendChild(content);

    directive.messages = [{ content: 'mensaje 1' }];
    directive.ngOnChanges({
      messages: {
        previousValue: [],
        currentValue: [{ content: 'mensaje 1' }],
        firstChange: true,
        isFirstChange: () => true
      }
    });
    
    directive.ngAfterViewChecked();

    expect(mockElement.scrollTop).toBeGreaterThan(0);
  });

  it('should not scroll when disabled', () => {
    const mockElement = document.createElement('div');
    const elementRef = new ElementRef(mockElement);
    const directive = new AutoScrollDirective(elementRef);

    directive.enabled = false;
    directive.messages = [{ content: 'mensaje 1' }];
    
    directive.ngAfterViewChecked();

    expect(mockElement.scrollTop).toBe(0);
  });
});
