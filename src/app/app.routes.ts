import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RecuperarSenhaComponent } from './pages/recuperar-senha/recuperar-senha.component';

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "home",
        component: HomeComponent
    },
    {
        path: "recuperar-senha",
        component: RecuperarSenhaComponent
    }
];
