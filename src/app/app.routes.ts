import { Routes } from "@angular/router";
import { ChatLayoutComponent } from "./modules/inbox/pages/inbox-layout/chat-layout.component";
import { ChatDetailComponent } from "./modules/inbox/pages/chat-detail/chat-detail.component";
import { ChatContainerComponent } from "./modules/chatbot/components/chat-container/chat-container.component";
import { LoginComponent } from "./modules/auth/components/login/login.component";
import { AuthGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: '', redirectTo: '/inbox', pathMatch: 'full' },
  
  // Authentication routes (public)
  { path: 'login', component: LoginComponent },
  
  // Protected routes
  { 
    path: 'inbox', 
    component: ChatLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'chat/:id', component: ChatDetailComponent }
    ]
  },
  
  { 
    path: 'chatbot', 
    component: ChatContainerComponent,
    canActivate: [AuthGuard] 
  },
  
  // Wildcard
  { path: '**', redirectTo: '/login' }
];