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
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { ChamadoService } from '../../../services/chamado/chamado.service';
import { ChamadoOutput } from '../../../models/chamado/chamadoOutput';
import { ModalAvaliacaoComponent } from '../../../components/modal-avaliacao/modal-avaliacao.component';
import { AvaliacaoInput } from '../../../models/chamado/avaliacaoInput';
import { ReabrirChamadoInput } from '../../../models/chamado/reabrirChamadoInput';
import { ModalReabrirComponent } from '../../../components/modal-reabrir/modal-reabrir.component';

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
    RESOLVIDO: 'Resolvido',
    CONCLUIDO: 'Concluído',
    REABERTO: 'Reaberto',
  };

  prioridadeLabels: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };

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
  selectedStatus: string = '';

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

      const searchParam = params.get('search');
      if (searchParam !== null) {
        this.searchTerm = searchParam;
      } else if (this.initialLoad) {
        this.searchTerm = '';
      }

      const statusParam = params.get('status');
      if (statusParam !== null && statusParam !== '') {
        if (this.statusKeys.includes(statusParam.toUpperCase())) {
          this.selectedStatus = statusParam;
        } else {
          shouldRedirect = true;
        }
      } else if (this.initialLoad) {
        this.selectedStatus = '';
      }

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

  podeEditar(status: string): boolean {
    const statusEditaveis = ['ABERTO', 'TRIAGEM', 'REABERTO'];
    return statusEditaveis.includes(status);
  }

  buscarChamados(): void {
    this.isLoading = true;
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

          if (this.currentPage >= this.totalPages && this.totalPages > 0) {
            this.currentPage = 0;
            this.buscarChamados();
          }
        },
        error: (err) => {
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
    this.router.navigate([`/chamado/${id}/detalhes`]);
  }

  editar(id: number): void {
    this.router.navigate([`/chamado/${id}/editar`]);
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
              this.buscarChamados();
            },
            error: (err) => {
              this.isLoading = false;
              const msg = err.error?.message || 'Erro ao avaliar.';
              this.snackBar.open(msg, 'Fechar', {
                duration: 4000,
                panelClass: ['snack-error'],
              });
            },
          });
      }
    });
  }

  reabrirChamado(chamado: ChamadoOutput): void {
    const dialogRef = this.dialog.open(ModalReabrirComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((dados: ReabrirChamadoInput) => {
      if (dados) {
        this.isLoading = true;
        this.chamadoService
          .reabrirChamado(this.token, chamado.id, dados)
          .subscribe({
            next: () => {
              this.snackBar.open(
                'Chamado reaberto e enviado ao técnico.',
                'OK',
                {
                  duration: 5000,
                  panelClass: ['snack-success'],
                }
              );
              this.buscarChamados();
            },
            error: (err) => {
              this.isLoading = false;
              const msg = err.error?.message || 'Erro ao reabrir chamado.';
              this.snackBar.open(msg, 'Fechar', {
                duration: 4000,
                panelClass: ['snack-error'],
              });
            },
          });
      }
    });
  }
}
