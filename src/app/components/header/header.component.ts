import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../services/auth/auth.service';
import { LoginService } from '../../services/login/login.service';
import { HeaderPerfilEnum } from '../../models/usuario/headerPerfilEnum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatIconModule, 
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  
  nomeUsuario: string = '';
  iniciais: string = '';
  perfilUsuario!: HeaderPerfilEnum;
  public HeaderPerfilEnum = HeaderPerfilEnum;
  token = localStorage.getItem('token') as string;

  notificacoes = [
    { 
      id: 1, 
      titulo: 'Chamado #1024 Atualizado', 
      mensagem: 'O técnico respondeu seu chamado.', 
      tempo: '5 min atrás', 
      lida: false 
    },
    { 
      id: 2, 
      titulo: 'Novo Usuário', 
      mensagem: 'Bruno Souza foi cadastrado na sua empresa.', 
      tempo: '1 hora atrás', 
      lida: false 
    },
    { 
      id: 3, 
      titulo: 'Manutenção Programada', 
      mensagem: 'O sistema ficará instável domingo às 03h.', 
      tempo: '1 dia atrás', 
      lida: true 
    }
  ];

  constructor(
    private authService: AuthService,
    private loginService: LoginService, 
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioLogado();
    if (usuario) {
      this.nomeUsuario = usuario.nome.split(' ')[0];
      this.perfilUsuario = usuario.perfil as HeaderPerfilEnum;
      const nomes = usuario.nome.split(' ');
      this.iniciais = nomes[0].charAt(0) + (nomes.length > 1 ? nomes[nomes.length - 1].charAt(0) : '');
    }
  }

  get unreadCount(): number {
    return this.notificacoes.filter(n => !n.lida).length;
  }

  logout() {
    this.loginService.logout(this.token);
  }
}