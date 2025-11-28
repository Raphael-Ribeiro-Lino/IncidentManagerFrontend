import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { ChamadoService } from '../../../services/chamado/chamado.service';
import { ChamadoOutput } from '../../../models/chamado/chamadoOutput';
import { ModalAvaliacaoComponent } from '../../../components/modal-avaliacao/modal-avaliacao.component';
import { AvaliacaoInput } from '../../../models/chamado/avaliacaoInput';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-listar-chamados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TitleCasePipe,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    PaginationComponent,
    MatTooltipModule,
  ],
  templateUrl: './listar-chamados.component.html',
  styleUrl: './listar-chamados.component.css',
})
export class ListarChamadosComponent implements OnInit {
  statusLabels: Record<string, string> = {
    ABERTO: 'Aberto',
    TRIAGEM: 'Triagem',
    EM_ATENDIMENTO: 'Em Atendimento',
    AGUARDANDO_CLIENTE: 'Aguardando Cliente',
    AGUARDANDO_PECA: 'Aguardando Peça',
    CONCLUIDO: 'Concluído',
    REABERTO: 'Reaberto',
  };

  // Chaves para iterar no select (ABERTO, TRIAGEM, etc.)
  statusKeys = Object.keys(this.statusLabels);

  chamadosExibidos: ChamadoOutput[] = [];

  currentPage: number = 0;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  maxPagesToShow: number = 5;
  token = localStorage.getItem('token') as string;

  isLoading: boolean = false;
  errorMessages: string[] = [];
  loadingFailed: boolean = false;

  searchTerm: string = '';
  selectedStatus: string = ''; // Substitui selectedPriority

  private initialLoad: boolean = true;

  constructor(
    private chamadoService: ChamadoService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let shouldRedirect = false;

      // 1. Validação da Página
      const pageParam = params.get('page');
      if (pageParam !== null) {
        const pageNumber = Number(pageParam);
        if (
          isNaN(pageNumber) ||
          !Number.isInteger(pageNumber) ||
          pageNumber < 0
        ) {
          shouldRedirect = true;
        } else {
          this.currentPage = pageNumber;
        }
      } else if (this.initialLoad) {
        this.currentPage = 0;
      }

      // 2. Validação do Termo de Busca
      const searchParam = params.get('search');
      if (searchParam !== null) {
        this.searchTerm = searchParam;
      } else if (this.initialLoad) {
        this.searchTerm = '';
      }

      // 3. Validação do Status (Substitui Prioridade)
      const statusParam = params.get('status');
      if (statusParam !== null && statusParam !== '') {
        // Verifica se o status passado existe na lista de chaves válidas
        if (this.statusKeys.includes(statusParam.toUpperCase())) {
          this.selectedStatus = statusParam;
        } else {
          // Se digitaram status=INVALIDO, redireciona para limpar
          shouldRedirect = true;
        }
      } else if (this.initialLoad) {
        this.selectedStatus = '';
      }

      // Se algum parâmetro foi inválido, limpa a URL
      if (shouldRedirect) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { page: 0, search: null, status: null },
          replaceUrl: true,
        });
        return;
      }

      this.buscarChamados();
      this.initialLoad = false;
    });
  }

  buscarChamados(): void {
    this.isLoading = true;

    // Certifique-se de atualizar seu ChamadoService para aceitar 'status' em vez de 'prioridade'
    this.chamadoService
      .listar(
        this.token,
        this.currentPage,
        this.searchTerm,
        this.selectedStatus
      )
      .subscribe({
        next: (pageData) => {
          this.chamadosExibidos = pageData.content;
          this.totalPages = pageData.page.totalPages;
          this.isLoading = false;
          this.errorMessages = [];
          this.loadingFailed = false;

          // Se a página atual for maior que o total, volta para a primeira
          if (this.currentPage >= this.totalPages && this.totalPages > 0) {
            this.currentPage = 0;
            this.buscarChamados();
          }
        },
        error: () => {
          this.isLoading = false;
          this.chamadosExibidos = [];
          this.errorMessages = ['Não foi possível carregar os chamados.'];
          this.loadingFailed = true;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.buscarChamados();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.buscarChamados();
  }

  novoChamado(): void {
    this.router.navigate(['/chamado/cadastrar']);
  }

  visualizar(id: number): void {
    this.router.navigate([`/chamado/${id}/detalhes`], {
      queryParams: {
        page: this.currentPage,
        search: this.searchTerm || null,
        status: this.selectedStatus || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  editar(id: number): void {
    this.router.navigate([`/chamado/${id}/editar`]);
  }

  reabrir(id: number): void {
    this.router.navigate([`/chamado/${id}/reabrir`]);
  }

  avaliarChamado(chamado: ChamadoOutput): void {
    const dialogRef = this.dialog.open(ModalAvaliacaoComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((avaliacao: AvaliacaoInput) => {
      if (avaliacao) {
        this.isLoading = true;

        this.chamadoService
          .avaliarChamado(this.token, chamado.id, avaliacao)
          .subscribe({
            next: () => {
              this.snackBar.open('Chamado avaliado e concluído!', 'OK', {
                duration: 5000,
                panelClass: ['snack-success'],
              });
              this.buscarChamados(); // Recarrega a lista para atualizar status
            },
            error: (err) => {
              this.isLoading = false;
              this.snackBar.open('Erro ao avaliar.', 'Fechar', {
                duration: 4000,
                panelClass: ['snack-error'],
              });
            },
          });
      }
    });
  }
}
