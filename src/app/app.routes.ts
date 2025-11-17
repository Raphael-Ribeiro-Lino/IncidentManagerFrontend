import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RecuperarSenhaComponent } from './pages/recuperar-senha/recuperar-senha.component';
import { RedefinirSenhaComponent } from './pages/redefinir-senha/redefinir-senha.component';
import { DefinirSenhaComponent } from './pages/definir-senha/definir-senha.component';
import { CadastrarEmpresaComponent } from './pages/cadastrar-empresa/cadastrar-empresa.component';
import { ListarEmpresasComponent } from './pages/listar-empresas/listar-empresas.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Public routes
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'recuperar-senha', component: RecuperarSenhaComponent },
    { path: 'redefinir-senha/:hash', component: RedefinirSenhaComponent },
    { path: 'definir-senha/:hash', component: DefinirSenhaComponent },

    // Protected routes
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuard]
    },
    {
        path: 'empresa',
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] },
        children: [
            { path: '', redirectTo: 'listar', pathMatch: 'full' },
            { path: 'cadastrar', component: CadastrarEmpresaComponent },
            { path: 'listar', component: ListarEmpresasComponent },
        ]
    },

    // 404 page
    { path: '**', component: NotFoundComponent }
];
