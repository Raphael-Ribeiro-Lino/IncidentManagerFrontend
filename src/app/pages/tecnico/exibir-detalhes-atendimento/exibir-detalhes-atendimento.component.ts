import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChamadoService } from '../../../services/chamado/chamado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChamadoDetalhadoOutput } from '../../../models/chamado/chamadoDetalhadoOutput';

@Component({
  selector: 'app-exibir-detalhes-atendimento',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './exibir-detalhes-atendimento.component.html',
  styleUrl: './exibir-detalhes-atendimento.component.css',
})
export class ExibirDetalhesAtendimentoComponent implements OnInit{

  chamado!: ChamadoDetalhadoOutput; // Tipagem correta com histórico
  
  chamadoCarregado = false;
  isLoading = false;
  errorMessages: string[] = [];

  chamadoId!: number;
  token = localStorage.getItem('token')!;

  // Variáveis para preservar o estado da lista anterior
  private paginaDeRetorno: string | null = null;
  private termoBuscaDeRetorno: string | null = null;
  private prioridadeDeRetorno: string | null = null;

  statusLabels: Record<string, string> = {
    ABERTO: 'Aberto',
    TRIAGEM: 'Triagem',
    EM_ATENDIMENTO: 'Em Atendimento',
    AGUARDANDO_CLIENTE: 'Aguardando Cliente',
    AGUARDANDO_PECA: 'Aguardando Peça',
    CONCLUIDO: 'Concluído',
    REABERTO: 'Reaberto',
  };

  constructor(
    private chamadoService: ChamadoService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.chamadoId = Number(idParam);

    if (!this.chamadoId || isNaN(this.chamadoId)) {
      this.errorMessages.push('ID do chamado inválido.');
      return;
    }

    // Captura parâmetros da URL para o botão "Voltar" funcionar direito
    this.paginaDeRetorno = this.route.snapshot.queryParamMap.get('page');
    this.termoBuscaDeRetorno = this.route.snapshot.queryParamMap.get('search');
    this.prioridadeDeRetorno = this.route.snapshot.queryParamMap.get('priority');

    this.carregarChamado();
  }

  carregarChamado(): void {
    this.isLoading = true;
    this.chamadoCarregado = false;
    this.errorMessages = [];

    // Usa o método novo que traz o ChamadoDetalhadoOutput
    this.chamadoService.buscarAtendimentoPorId(this.token, this.chamadoId).subscribe({
      next: (dados) => {
        this.chamado = dados;
        
        // Ordena histórico: Mais recente primeiro (Descendente)
        if (this.chamado.historicoEventos) {
          this.chamado.historicoEventos.sort((a, b) => 
            new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
          );
        }

        this.chamadoCarregado = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessages.push('Não foi possível carregar os dados do chamado.');
        this.isLoading = false;
      },
    });
  }

  // --- Auxiliares de Visualização ---

  getFileIcon(nomeArquivo: string): string {
    const ext = nomeArquivo.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc': case 'docx': return 'description';
      case 'png': case 'jpg': case 'jpeg': return 'image';
      case 'zip': case 'rar': return 'folder_zip';
      default: return 'attach_file';
    }
  }

  getTimelineIcon(tipo: string): string {
    switch (tipo) {
      case 'ABERTURA': return 'flag';
      case 'MUDANCA_STATUS': return 'swap_horiz';
      case 'NOTA_INTERNA': return 'lock'; // Cadeado para nota interna
      case 'INTERACAO': return 'chat_bubble_outline';
      case 'CONCLUSAO': return 'check_circle';
      default: return 'info';
    }
  }

  // --- Ações ---

  voltarParaLista(): void {
    const queryParams: Record<string, string> = {};
    if (this.paginaDeRetorno) queryParams['page'] = this.paginaDeRetorno;
    if (this.termoBuscaDeRetorno) queryParams['search'] = this.termoBuscaDeRetorno;
    if (this.prioridadeDeRetorno) queryParams['priority'] = this.prioridadeDeRetorno;

    // Redireciona para a lista do técnico
    this.router.navigate(['/tecnico/meus-atendimentos'], { queryParams });
  }

  acessarChat(): void {
    console.log('Navegar para chat...');
  }

  mudarStatus(): void {
    console.log('Abrir modal de status...');
  }

  adicionarNotaInterna(): void {
    console.log('Abrir modal de nota interna...');
  }

  baixarAnexo(path: string): void {
    if (path) window.open(path, '_blank');
  }
}
