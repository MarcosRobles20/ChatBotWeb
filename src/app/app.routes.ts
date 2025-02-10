import { Routes } from '@angular/router';
import { BandejaEntradaUsuariosComponent } from './bandeja-entrada/bandeja-entrada-usuarios/bandeja-entrada-usuarios.component';
import { DetalleUsuarioComponent } from './bandeja-entrada/pages/detalle-usuario/detalle-usuario.component';
import { ChatContainerComponent } from './chatbot/components/chat-container/chat-container.component';

export const routes: Routes = [
  { path: '', redirectTo: '/bandeja-entrada', pathMatch: 'full' },
  { path: 'bandeja-entrada', component: BandejaEntradaUsuariosComponent },
  { path: 'detalle-usuario/:id', component: DetalleUsuarioComponent },
  { path: 'chatbot', component: ChatContainerComponent }
];