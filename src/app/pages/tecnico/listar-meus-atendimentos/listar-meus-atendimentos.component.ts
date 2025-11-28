import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs'; // <--- IMPORTANTE

// Components & Models
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { ChamadoOutput } from '../../../models/chamado/chamadoOutput';
import { ChamadoService } from '../../../services/chamado/chamado.service';
import { SolicitarTransferenciaInput } from '../../../models/chamado/solicitarTransferenciaInput';

// Import do Componente Filho e Serviço de Transferência
import { TransferenciaService } from '../../../services/transferencia/transferencia.service';
import { ListarTransferenciasPendentesComponent } from '../listar-transferencias-pendentes/listar-transferencias-pendentes.component';
import { ModalSolicitarTransferenciaComponent } from '../../../components/modal-solicitar-transferencia/modal-solicitar-transferencia.component';
import { ListarTransferenciasEnviadasComponent } from '../listar-transferencias-enviadas/listar-transferencias-enviadas.component';

@Component({
  selector: 'app-listar-meus-atendimentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatTabsModule, // <--- Adicionado
    MatDialogModule,
    MatSnackBarModule,
    PaginationComponent,
    DatePipe,
    ListarTransferenciasPendentesComponent,
    ListarTransferenciasEnviadasComponent,
  ],
  templateUrl: './listar-meus-atendimentos.component.html',
  styleUrl: './listar-meus-atendimentos.component.css',
})
export class ListarMeusAtendimentosComponent implements OnInit {
  // --- ABA 1: MEUS CHAMADOS (Variáveis existentes) ---
  chamados: ChamadoOutput[] = [];
  page: number = 0;
  totalPages: number = 0;
  totalElementos: number = 0;
  busca: string = '';
  prioridadeSelecionada: string = '';
  private searchSubject = new Subject<string>();
  isLoading: boolean = false;
  loadingFailed: boolean = false;
  errorMessages: string[] = [];
  token = localStorage.getItem('token') as string;

  // --- ABA 2: CONTADOR DE PENDÊNCIAS ---
  pendenciasCount: number = 0;
  // --- ABA 3: CONTADOR DE ENVIADAS
  enviadasCount: number = 0;

  prioridadeLabels: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };

  constructor(
    private chamadoService: ChamadoService,
    private transferenciaService: TransferenciaService, // Injetado para buscar contagem
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe((term) => {
      this.busca = term;
      this.page = 0;
      this.carregarChamados();
    });
  }

  ngOnInit(): void {
    this.carregarChamados();
    this.atualizarCountPendencias();
    this.atualizarCountEnviadas(); // Busca o número da bolinha vermelha
  }

  // --- LÓGICA DA ABA 1 ---
  onSearchInput(term: string) {
    this.searchSubject.next(term);
  }

  carregarChamados(): void {
    this.isLoading = true;
    this.loadingFailed = false;

    this.chamadoService
      .listarMeusAtendimentos(
        this.token,
        this.page,
        this.busca,
        this.prioridadeSelecionada
      )
      .subscribe({
        next: (response) => {
          this.chamados = response.content;
          this.totalPages = response.page.totalPages;
          this.totalElementos = response.page.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.loadingFailed = true;
          this.errorMessages = [
            err.error?.message ||
              'Não foi possível carregar os atendimentos. Verifique sua conexão ou tente novamente mais tarde.',
          ];
        },
      });
  }

  filtrar(): void {
    this.page = 0;
    this.carregarChamados();
  }

  paginar(event: number): void {
    this.page = event;
    this.carregarChamados();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  verDetalhes(id: number): void {
    this.router.navigate([`/tecnico/atendimento/${id}/detalhes`]);
  }

  // Regra do Backend: Só transfere se ABERTO
  podeTransferir(status: string): boolean {
    return status === 'ABERTO';
  }

  // --- LÓGICA DA ABA 2 (Atualização do Badge) ---

  atualizarCountPendencias(): void {
    // Busca apenas 1 item para ser leve, só queremos o 'totalElements'
    this.transferenciaService
      .listarMinhasPendencias(this.token, 0, '')
      .subscribe({
        next: (page) => {
          this.pendenciasCount = page.page.totalElements;

          // Se o count mudou (ex: aceitou um chamado), ele vem pra lista principal,
          // então recarregamos a aba 1 para refletir a mudança
          this.carregarChamados();
        },
        error: () => {
          // Silencioso em caso de erro no count
        },
      });
  }

  atualizarCountEnviadas(): void {
    // Busca uma página pequena (size=1) apenas para ler o totalElements no metadata
    this.transferenciaService
      .listarMinhasSolicitacoes(this.token, 0, '')
      .subscribe({
        next: (page) => {
          this.enviadasCount = page.page.totalElements;
          this.carregarChamados();
        },
        error: () => {
          /* Silencioso */
        },
      });
  }

  // --- AÇÃO DE TRANSFERIR (Envia para outro) ---
  abrirModalTransferencia(chamado: ChamadoOutput): void {
    const dialogRef = this.dialog.open(ModalSolicitarTransferenciaComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((dados: SolicitarTransferenciaInput) => {
      if (dados) {
        this.isLoading = true;
        this.chamadoService
          .solicitarTransferencia(this.token, chamado.id, dados)
          .subscribe({
            next: () => {
              this.snackBar.open('Transferência solicitada!', 'OK', {
                duration: 4000,
                panelClass: ['snack-success'],
              });
              this.carregarChamados(); // Remove da minha lista
            },
            error: (err) => {
              this.isLoading = false;
              this.snackBar.open(err.error?.message || 'Erro.', 'Fechar', {
                duration: 5000,
                panelClass: ['snack-error'],
              });
            },
          });
      }
    });
  }
}
