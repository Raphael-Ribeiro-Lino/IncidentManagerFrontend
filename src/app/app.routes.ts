import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RecuperarSenhaComponent } from './pages/recuperar-senha/recuperar-senha.component';
import { RedefinirSenhaComponent } from './pages/redefinir-senha/redefinir-senha.component';
import { DefinirSenhaComponent } from './pages/definir-senha/definir-senha.component';
import { CadastrarEmpresaComponent } from './pages/empresa/cadastrar-empresa/cadastrar-empresa.component';
import { ListarEmpresasComponent } from './pages/empresa/listar-empresas/listar-empresas.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { CadastrarUsuarioComponent } from './pages/usuario/cadastrar-usuario/cadastrar-usuario.component';
import { ListarUsuariosComponent } from './pages/usuario/listar-usuarios/listar-usuarios.component';
import { AlterarDadosUsuarioComponent } from './pages/usuario/alterar-dados-usuario/alterar-dados-usuario.component';
import { AlterarMeusDadosComponent } from './pages/usuario/alterar-meus-dados/alterar-meus-dados.component';

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
    canActivate: [authGuard],
  },
  {
    path: 'empresa',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'cadastrar', component: CadastrarEmpresaComponent },
      { path: 'listar', component: ListarEmpresasComponent },
    ],
  },
  {
    path: 'usuario/alterar-meus-dados',
    component: AlterarMeusDadosComponent,
    canActivate: [authGuard],
  },
  {
    path: 'usuario',
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'ADMIN_EMPRESA'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'cadastrar', component: CadastrarUsuarioComponent },
      { path: 'listar', component: ListarUsuariosComponent },
      { path: ':id/editar', component: AlterarDadosUsuarioComponent },
    ],
  },

  // 404 page
  { path: '**', component: NotFoundComponent },
];
