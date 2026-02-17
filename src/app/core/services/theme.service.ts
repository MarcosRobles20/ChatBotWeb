import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  darkMode = signal<boolean>(false);

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // if exists, use saved theme; otherwise, use system preference
    // Si hay un tema guardado, usarlo; sino, usar la preferencia del sistema
    const isDark = savedTheme !== null ? savedTheme === 'true' : prefersDark;
    
    this.darkMode.set(isDark);
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    const newTheme = !this.darkMode();
    this.darkMode.set(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('darkMode', String(newTheme));
  }

  private applyTheme(isDark: boolean): void {
    const body = document.body;
    
    if (isDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }

  isDarkMode(): boolean {
    return this.darkMode();
  }
}
