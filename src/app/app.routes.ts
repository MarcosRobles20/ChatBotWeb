import { Routes } from "@angular/router";
import { ChatLayoutComponent } from "./modules/inbox/pages/inbox-layout/chat-layout.component";
import { DetalleUsuarioComponent } from "./modules/inbox/pages/chat-detail/detalle-usuario.component";
import { ChatContainerComponent } from "./modules/chatbot/components/chat-container/chat-container.component";

export const routes: Routes = [
  { path: '', redirectTo: '/inbox', pathMatch: 'full' },
  
  // Rutas con sidebar layout - Módulo Inbox
  { 
    path: 'inbox', 
    component: ChatLayoutComponent,
    children: [
      { path: '', redirectTo: 'chats', pathMatch: 'full' },
      { path: 'chats', component: ChatLayoutComponent },
      { path: 'chat/:id', component: DetalleUsuarioComponent }
    ]
  },
  
  // Rutas independientes
  { path: 'chatbot', component: ChatContainerComponent },
  
  // Rutas de compatibilidad (mantener por si acaso)
  { path: 'bandeja-entrada', redirectTo: '/inbox', pathMatch: 'full' },
  { path: 'detalle-usuario/:id', redirectTo: '/inbox/chat/:id', pathMatch: 'full' }
];