import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs'; // Importante para o filtro funcionar bem

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components & Services
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { ChamadoOutput } from '../../../models/chamado/chamadoOutput';
import { ChamadoService } from '../../../services/chamado/chamado.service';

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
    PaginationComponent,
    DatePipe,
  ],
  templateUrl: './listar-meus-atendimentos.component.html',
  styleUrl: './listar-meus-atendimentos.component.css',
})
export class ListarMeusAtendimentosComponent implements OnInit {
  
  // Dados
  chamados: ChamadoOutput[] = [];
  
  // Paginação
  page: number = 0;
  totalPages: number = 0;
  totalElementos: number = 0;
  
  // Filtros
  busca: string = '';
  prioridadeSelecionada: string = '';
  private searchSubject = new Subject<string>(); // Controle do Debounce

  // Controle de Estado
  isLoading: boolean = false;
  loadingFailed: boolean = false; // Controle de erro visual
  errorMessages: string[] = [];   // Mensagens de erro
  
  token = localStorage.getItem('token') as string;

  // Mapeamento para labels amigáveis
  prioridadeLabels: Record<string, string> = {
    'BAIXA': 'Baixa',
    'MEDIA': 'Média',
    'ALTA': 'Alta',
    'CRITICA': 'Crítica'
  };

  constructor(
    private chamadoService: ChamadoService,
    private router: Router
  ) {
    // Configura o Debounce: espera 300ms após parar de digitar para buscar
    this.searchSubject.pipe(debounceTime(300)).subscribe((term) => {
      this.busca = term;
      this.page = 0;
      this.carregarChamados();
    });
  }

  ngOnInit(): void {
    this.carregarChamados();
  }

  // Método chamado pelo input de busca
  onSearchInput(term: string) {
    this.searchSubject.next(term);
  }

  carregarChamados(): void {
    this.isLoading = true;
    this.loadingFailed = false;
    this.errorMessages = [];
    
    this.chamadoService.listarMeusAtendimentos(
      this.token, 
      this.page, 
      this.busca, 
      this.prioridadeSelecionada
    ).subscribe({
      next: (response) => {
        // Ajuste conforme seu retorno (response.content ou response directly)
        this.chamados = response.content; 
        this.totalPages = response.page.totalPages;
        this.totalElementos = response.page.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.loadingFailed = true;
        this.chamados = [];
        
        // Tratamento de mensagem de erro
        const msg = err.error?.message || 'Não foi possível carregar os seus atendimentos.';
        this.errorMessages = [msg];
        console.error('Erro ao carregar chamados', err);
      }
    });
  }

  // --- Ações de Filtro e Paginação ---

  filtrar(): void {
    this.page = 0; 
    this.carregarChamados();
  }

  paginar(event: number): void {
    this.page = event;
    this.carregarChamados();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Navegação e Ações ---

  verDetalhes(id: number): void {
    this.router.navigate([`/chamado/${id}/detalhes`]);
  }

  // --- Regras de Negócio ---

  podeTransferir(status: string): boolean {
    return status === 'ABERTO';
  }

  podeMudarStatus(status: string): boolean {
    return status !== 'CONCLUIDO';
  }

  // Stubs para os Modais
  abrirModalStatus(chamado: ChamadoOutput): void {
    console.log('Abrir Modal Status para:', chamado.protocolo);
  }

  abrirModalTransferencia(chamado: ChamadoOutput): void {
    console.log('Abrir Modal Transferência para:', chamado.protocolo);
  }
}