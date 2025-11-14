import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RecuperarSenhaComponent } from './pages/recuperar-senha/recuperar-senha.component';
import { RedefinirSenhaComponent } from './pages/redefinir-senha/redefinir-senha.component';
import { DefinirSenhaComponent } from './pages/definir-senha/definir-senha.component';

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
    },
    {
        path: "redefinir-senha/:hash",
        component: RedefinirSenhaComponent
    },
    {
        path: "definir-senha/:hash",
        component: DefinirSenhaComponent
    }
];
