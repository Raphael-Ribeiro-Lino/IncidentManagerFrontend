import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UsuarioOutput } from '../../../models/usuario/usuarioOutput';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-listar-usuario',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    PaginationComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.css'],
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: UsuarioOutput[] = [];
  isLoading = false;
  searchTerm = '';
  errorMessages: string[] = [];
  successfullyRegisteredUsuario = '';
  token = localStorage.getItem('token') as string;
  currentPage = 0;
  totalPages = 0;
  public loadingFailed: boolean = false;
  perfilLabels: Record<string, string> = {
    ADMIN_EMPRESA: 'Administrador da Empresa',
    USUARIO: 'Usuário Comum',
    TECNICO_TI: 'Técnico de TI',
  };

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(page: number = 0) {
    this.isLoading = true;
    this.usuarioService.listar(this.token, page, this.searchTerm).subscribe({
      next: (data) => {
        this.usuarios = data.content;
        this.currentPage = data.page.number;
        this.totalPages = data.page.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.usuarios = [];
        this.errorMessages = ['Não foi possível carregar os usuários.'];
        this.isLoading = false;
        this.loadingFailed = true;
      },
    });
  }

  searchUsuarios(term: string) {
    this.searchTerm = term;
    this.carregarUsuarios(0);
  }

  limparBusca() {
    this.searchTerm = '';
    this.carregarUsuarios(0);
  }

  carregarPagina(page: number) {
    this.carregarUsuarios(page);
  }
}
