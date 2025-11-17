import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RecuperarSenhaComponent } from './pages/recuperar-senha/recuperar-senha.component';
import { RedefinirSenhaComponent } from './pages/redefinir-senha/redefinir-senha.component';
import { DefinirSenhaComponent } from './pages/definir-senha/definir-senha.component';
import { authGuard } from './guards/auth.guard';
import { CadastrarEmpresaComponent } from './pages/cadastrar-empresa/cadastrar-empresa.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ListarEmpresasComponent } from './pages/listar-empresas/listar-empresas.component';

export const routes: Routes = [
    {
        path: "",
        component: LandingPageComponent
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "home",
        component: HomeComponent,
        canActivate: [authGuard]
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
    },
    {
        path: "cadastrar-empresa",
        component: CadastrarEmpresaComponent,
        canActivate: [authGuard],
        data: {
            roles: ['ADMIN']
        }
    },
    {
        path: "listar-empresas",
        component: ListarEmpresasComponent,
        canActivate: [authGuard],
        data: {
            roles: ['ADMIN']
        }
    },
    {
        path: "**",
        component: NotFoundComponent
    }
];
