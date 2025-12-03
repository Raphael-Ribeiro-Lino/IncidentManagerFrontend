import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChamadoService } from '../../../services/chamado/chamado.service';
import { ChamadoDetalhadoOutput } from '../../../models/chamado/chamadoDetalhadoOutput'; // Use o DTO detalhado
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatChamadoComponent } from '../../../components/chat-chamado/chat-chamado.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-exibir-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './exibir-detalhes.component.html',
  styleUrl: './exibir-detalhes.component.css',
})
export class ExibirDetalhesComponent implements OnInit {
  chamado!: ChamadoDetalhadoOutput;

  chamadoCarregado = false;
  isLoading = false;
  errorMessages: string[] = [];

  chamadoId!: number;
  token = localStorage.getItem('token')!;

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
    RESOLVIDO: 'Resolvido',
  };
  prioridadeLabels: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };

  constructor(
    private chamadoService: ChamadoService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.chamadoId = Number(idParam);

    if (!this.chamadoId || isNaN(this.chamadoId)) {
      this.errorMessages.push('ID do chamado inválido.');
      return;
    }

    this.paginaDeRetorno = this.route.snapshot.queryParamMap.get('page');
    this.termoBuscaDeRetorno = this.route.snapshot.queryParamMap.get('search');
    this.prioridadeDeRetorno =
      this.route.snapshot.queryParamMap.get('priority');

    this.carregarChamado();
  }

  carregarChamado(): void {
    this.isLoading = true;
    this.chamadoCarregado = false;
    this.errorMessages = [];

    this.chamadoService.buscarPorId(this.token, this.chamadoId).subscribe({
      next: (chamado: any) => {
        this.chamado = chamado;

        if (this.chamado.historicoEventos) {
          this.chamado.historicoEventos.sort(
            (a, b) =>
              new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
          );
        }

        this.chamadoCarregado = true;
        this.isLoading = false;
        this.errorMessages = [];
      },
      error: (err) => {
        console.error(err);
        this.errorMessages.push(
          'Não foi possível carregar os dados do chamado.'
        );
        this.isLoading = false;
        this.chamadoCarregado = false;
      },
    });
  }

  getLocalDateTimeString(isoDateString: string): string {
    return isoDateString;
  }

  getFileIcon(nomeArquivo: string): string {
    const ext = nomeArquivo.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'image';
      case 'zip':
      case 'rar':
        return 'folder_zip';
      default:
        return 'attach_file';
    }
  }

  getTimelineIcon(tipo: string): string {
    switch (tipo) {
      case 'ABERTURA':
        return 'flag';
      case 'MUDANCA_STATUS':
        return 'swap_horiz';
      case 'INTERACAO':
        return 'chat_bubble_outline';
      case 'CONCLUSAO':
        return 'check_circle';
      case 'REABERTURA':
        return 'replay';
      default:
        return 'info';
    }
  }

  voltarParaLista(): void {
    const queryParams: Record<string, string> = {};
    if (this.paginaDeRetorno) queryParams['page'] = this.paginaDeRetorno;
    if (this.termoBuscaDeRetorno)
      queryParams['search'] = this.termoBuscaDeRetorno;
    if (this.prioridadeDeRetorno)
      queryParams['priority'] = this.prioridadeDeRetorno;
    this.router.navigate(['/chamado/listar'], { queryParams });
  }

  podeAcessarChat(status: string): boolean {
    const statusPermitidos = [
      'EM_ATENDIMENTO',
      'AGUARDANDO_CLIENTE',
      'AGUARDANDO_PECA',
      'REABERTO',
    ];
    return statusPermitidos.includes(status);
  }

  acessarChat(): void {
    this.dialog.open(ChatChamadoComponent, {
      width: '800px', // Mais largo no desktop
      height: '90vh', // Altura responsiva
      maxWidth: '95vw', // Quase tela toda no mobile
      maxHeight: '90vh',
      hasBackdrop: true, // Com fundo escuro para focar
      data: {
        chamadoId: this.chamado.id,
        protocolo: this.chamado.protocolo,
        status: this.chamado.status,
      },
      // Remove padding padrão do material se tiver a classe global configurada
      panelClass: 'chat-modal-panel',
    });
  }

  baixarAnexo(storagePath: string): void {
    if (!storagePath) return;
    const link = document.createElement('a');
    link.href = storagePath;
    link.target = '_blank';
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
