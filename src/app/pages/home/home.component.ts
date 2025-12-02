import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../services/auth/auth.service';
import { HeaderPerfilEnum } from '../../models/usuario/headerPerfilEnum';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  nomeUsuario: string = '';
  perfil: string = '';

  // Disponibiliza o Enum para o HTML
  PerfilEnum = HeaderPerfilEnum;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUsuarioLogado();
    if (user) {
      this.nomeUsuario = user.nome.split(' ')[0]; // Primeiro nome
      this.perfil = user.perfil;
    }
  }
}
