import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChamadoService } from '../../../services/chamado/chamado.service';
import { ChamadoOutput } from '../../../models/chamado/chamadoOutput';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-exibir-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
  ],
  templateUrl: './exibir-detalhes.component.html',
  styleUrl: './exibir-detalhes.component.css',
})
export class ExibirDetalhesComponent implements OnInit {
  chamado!: ChamadoOutput;
  chamadoCarregado = false;
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
  };

  constructor(
    private chamadoService: ChamadoService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.chamadoId = Number(idParam);

    if (!this.chamadoId || isNaN(this.chamadoId)) {
      this.errorMessages.push('ID do chamado inválido.');
      return;
    }

    this.carregarChamado();

    this.paginaDeRetorno = this.route.snapshot.queryParamMap.get('page');
    this.termoBuscaDeRetorno = this.route.snapshot.queryParamMap.get('search');
    this.prioridadeDeRetorno = this.route.snapshot.queryParamMap.get('priority');
  }

  carregarChamado(): void {
    this.chamadoService.buscarPorId(this.token, this.chamadoId).subscribe({
      next: (chamado) => {
        this.chamado = chamado;
        this.chamadoCarregado = true;
        this.errorMessages = [];
      },
      error: () => {
        this.errorMessages.push('Erro ao carregar dados do chamado.');
        this.chamadoCarregado = true;
      },
    });
  }

  getLocalDateTimeString(isoDateString: string): string {
    return isoDateString?.endsWith('Z')
      ? isoDateString.slice(0, -1)
      : isoDateString;
  }

  getFileIcon(tipo: string): string {
    const ext = tipo.toLowerCase();
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
        return 'folder_zip';
      default:
        return 'attach_file';
    }
  }

  voltarParaLista(): void {
    const queryParams: Record<string, string> = {};

    if (this.paginaDeRetorno) queryParams['page'] = this.paginaDeRetorno;
    if (this.termoBuscaDeRetorno) queryParams['search'] = this.termoBuscaDeRetorno;
    if (this.prioridadeDeRetorno) queryParams['priority'] = this.prioridadeDeRetorno;

    this.router.navigate(['/chamado/listar'], { queryParams });
  }

  acessarChat(): void {
    alert('Funcionalidade de Atualizar Chamado será implementada.');
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
