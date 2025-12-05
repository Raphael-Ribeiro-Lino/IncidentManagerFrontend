import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// App Components & Services
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { UsuarioOutput } from '../../../models/usuario/usuarioOutput';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    PaginationComponent,
    MatSelectModule,
  ],
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.css'],
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: UsuarioOutput[] = [];

  // Estados de Carregamento
  isLoading = false;
  loadingFailed = false;
  errorMessages: string[] = [];
  successMessage = '';

  // Filtros
  searchTerm = '';
  selectedAtivo = '';
  private searchSubject = new Subject<string>();

  // Paginação
  currentPage = 0;
  totalPages = 0;

  token = localStorage.getItem('token') as string;

  // Dicionário para Labels Amigáveis
  perfilLabels: Record<string, string> = {
    ADMIN_EMPRESA: 'Administrador',
    USUARIO: 'Usuário Comum',
    TECNICO_TI: 'Técnico TI',
  };

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private dialog: MatDialog
  ) {
    // Recupera mensagem de sucesso (Toast) vinda de outra rota
    const nav = router.getCurrentNavigation();
    if (nav?.extras?.state?.['successData']) {
      this.successMessage = nav.extras.state['successData'];
      setTimeout(() => (this.successMessage = ''), 4000);
    }

    // Debounce na busca para evitar requisições excessivas
    this.searchSubject.pipe(debounceTime(300)).subscribe((term) => {
      this.carregarUsuarios(0, term);
    });
  }

  ngOnInit(): void {
    this.carregarUsuarios(0);
  }

  // --- Buscas e Carregamento ---

  carregarUsuarios(page: number = 0, term: string = this.searchTerm) {
    this.isLoading = true;
    this.loadingFailed = false;
    this.errorMessages = [];

    this.usuarioService
      .listar(this.token, page, term, this.selectedAtivo)
      .subscribe({
        next: (data) => {
          this.usuarios = data.content;
          this.currentPage = data.page.number;
          this.totalPages = data.page.totalPages;
          this.isLoading = false;
        },
        error: (err) => {
          this.usuarios = [];
          this.isLoading = false;
          this.loadingFailed = true;
          this.errorMessages = [
            err.error?.message ||
              'Ocorreu um erro inesperado ao carregar os usuários.',
          ];
        },
      });
  }

  searchUsuarios(term: string) {
    this.searchTerm = term;
    this.searchSubject.next(term.trim());
  }

  limparBusca() {
    this.searchTerm = '';
    this.selectedAtivo = '';
    this.carregarUsuarios(0);
  }

  carregarPagina(page: number) {
    this.carregarUsuarios(page);
  }

  onFilterChange() {
    this.currentPage = 0;
    this.carregarPagina(0);
  }

  // --- Ações ---

  reenviarConvite(usuario: UsuarioOutput) {
    // Usa o Modal Padronizado
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Reenviar Convite',
        mensagem: `Deseja reenviar o e-mail de definição de senha para <b>${usuario.nome}</b>?`,
        textoConfirmar: 'Reenviar',
        corBotao: 'primary', // Azul (Ação segura/positiva)
        icone: 'mail_outline', // Ícone específico
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.executarReenvio(usuario.id, usuario.email);
      }
    });
  }

  private executarReenvio(id: number, email: string) {
    this.isLoading = true;
    this.usuarioService.reenviarEmailDefinicaoSenha(this.token, id).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = `Convite reenviado com sucesso para <b>${email}</b>!`;
        this.carregarUsuarios();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => (this.successMessage = ''), 5000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessages = [err.error?.message || 'Erro ao reenviar e-mail. Verifique sua conexão ou tente novamente mais tarde.'];
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => (this.errorMessages = []), 4000);
      },
    });
  }
}
