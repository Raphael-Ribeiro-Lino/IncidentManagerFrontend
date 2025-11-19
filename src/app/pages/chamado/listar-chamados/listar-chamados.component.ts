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

  chamadosExibidos: ChamadoOutput[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  maxPagesToShow: number = 5;
  token = localStorage.getItem('token') as string;

  isLoading: boolean = false;
  errorMessages: string[] = [];
  loadingFailed: boolean = false;

  prioridades = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];
  searchTerm: string = '';
  selectedPriority: string = '';

  constructor(
    private chamadoService: ChamadoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const page = params.get('page');
      const search = params.get('search');
      const priority = params.get('priority');

      if (page !== null && !isNaN(Number(page))) {
        this.currentPage = Number(page);
      }

      if (search !== null) {
        this.searchTerm = search;
      }

      if (priority !== null) {
        this.selectedPriority = priority;
      }

      this.buscarChamados();
    });
  }

  buscarChamados(): void {
    this.isLoading = true;

    this.chamadoService
      .listar(this.token, this.currentPage, this.searchTerm, this.selectedPriority)
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
    this.router.navigate(
      [`/chamado/${id}/detalhes`],
      {
        queryParams: {
          page: this.currentPage,
          search: this.searchTerm || null,
          priority: this.selectedPriority || null,
        },
        queryParamsHandling: 'merge'
      }
    );
  }

  editar(id: number): void {
    this.router.navigate([`/chamado/${id}/editar`]);
  }

  reabrir(id: number): void {
    this.router.navigate([`/chamado/${id}/reabrir`]);
  }
}
