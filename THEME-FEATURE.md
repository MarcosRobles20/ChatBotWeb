# 🌓 Dark/Light Theme Feature

## Implementación Completa

Se ha implementado exitosamente el sistema de temas dark/light usando Angular Material.

## ✅ Componentes Creados

### 1. ThemeService
**Ubicación:** `src/app/core/services/theme.service.ts`

- Maneja el estado del tema con Angular signals
- Guarda preferencia en localStorage
- Detecta preferencia del sistema operativo
- Aplica clases CSS dinámicamente al `<html>`

### 2. ThemeToggleComponent  
**Ubicación:** `src/app/shared/components/theme-toggle/theme-toggle.component.ts`

- Botón de toggle standalone
- Íconos: `light_mode` / `dark_mode`
- Tooltip descriptivo
- Animación de rotación en hover
- Ubicado en el toolbar principal

## 🎨 Temas Configurados

### Light Theme
- Primary: Indigo
- Accent: Pink
- Background: #ffffff / #f5f5f5

### Dark Theme  
- Primary: Blue
- Accent: Amber
- Background: #121212 / #1e1e1e

## 📋 Variables CSS Personalizadas

```css
/* Light Theme */
--bg-primary: #ffffff
--bg-secondary: #f5f5f5
--bg-input: #f5f5f5
--text-primary: rgba(0, 0, 0, 0.87)
--text-secondary: rgba(0, 0, 0, 0.6)
--border-color: rgba(0, 0, 0, 0.12)

/* Dark Theme */
--bg-primary: #121212
--bg-secondary: #1e1e1e
--bg-input: #2d2d2d
--text-primary: #ffffff
--text-secondary: rgba(255, 255, 255, 0.7)
--border-color: rgba(255, 255, 255, 0.12)
```

## 🔧 Componentes Actualizados

- ✅ `chat-container.component.css` - Usa variables del tema
- ✅ `chat-area.component.css` - Background adaptativo
- ✅ `input-field.component.css` - Input con tema
- ✅ `chat-layout.component` - Botón de toggle en toolbar
- ✅ `styles.scss` - Temas globales de Material

## 📦 Cambios en Configuración

### angular.json
```json
"styles": [
  "src/styles.scss"  // Cambiado de .css a .scss
]
```

### styles.scss
- Importa `@angular/material` con sintaxis SASS
- Define paletas de colores personalizadas
- Configura temas light y dark
- Aplica temas con mixins de Material

## 🚀 Uso

El tema cambia automáticamente al hacer clic en el botón del toolbar:
- 🌙 Modo oscuro - Para uso nocturno
- ☀️ Modo claro - Para uso diurno

La preferencia se guarda en localStorage y persiste entre sesiones.

## 🎯 Características

- ✅ Detección automática de preferencia del sistema
- ✅ Persistencia en localStorage
- ✅ Transiciones suaves (0.3s)
- ✅ Todos los componentes de Material adaptados
- ✅ Variables CSS para fácil personalización
- ✅ Iconos intuitivos
- ✅ Tooltip descriptivo

## 🔮 Mejoras Futuras Posibles

- Agregar más variantes de temas (high contrast, custom colors)
- Sincronización entre pestañas del navegador
- Scheduled theme switching (automático según hora del día)
- Temas personalizados por usuario
