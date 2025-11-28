import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { TransferenciaOutput } from '../../../models/transferencia/transferenciaOutput';
import { TransferenciaService } from '../../../services/transferencia/transferencia.service';
import { debounceTime, Subject } from 'rxjs';
import { ModalVisualizarChamadoComponent } from '../../../components/modal-visualizar-chamado/modal-visualizar-chamado.component';
import { TransferenciaDetalhadaOutput } from '../../../models/transferencia/transferenciaDetalhadaOutput';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-listar-transferencias-enviadas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    PaginationComponent,
    DatePipe,
  ],
  templateUrl: './listar-transferencias-enviadas.component.html',
  styleUrl: './listar-transferencias-enviadas.component.css',
})
export class ListarTransferenciasEnviadasComponent implements OnInit {
  @Output() listaAtualizada = new EventEmitter<void>();
  
  transferencias: TransferenciaDetalhadaOutput[] = [];

  page: number = 0;
  totalPages: number = 0;
  totalElementos: number = 0;

  busca: string = '';
  private searchSubject = new Subject<string>();

  isLoading: boolean = false;
  token = localStorage.getItem('token')!;

  loadingFailed: boolean = false;
  errorMessages: string[] = [];

  constructor(
    private transferenciaService: TransferenciaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.searchSubject.pipe(debounceTime(400)).subscribe((term) => {
      this.busca = term;
      this.page = 0;
      this.carregarEnviadas();
    });
  }

  ngOnInit(): void {
    this.carregarEnviadas();
  }

  onSearchInput(term: string): void {
    this.searchSubject.next(term);
  }

  carregarEnviadas(): void {
    this.isLoading = true;
    this.loadingFailed = false;
    this.errorMessages = [];

    this.transferenciaService
      .listarMinhasSolicitacoes(this.token, this.page, this.busca)
      .subscribe({
        next: (response) => {
          this.transferencias = response.content;
          this.totalPages = response.page.totalPages;
          this.totalElementos = response.page.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.loadingFailed = true;
          this.errorMessages = [
            'Não foi possível carregar o histórico de transferências. Verifique sua conexão ou tente novamente mais tarde.',
          ];
        },
      });
  }

  paginar(page: number): void {
    this.page = page;
    this.carregarEnviadas();
  }

  verChamado(transferencia: TransferenciaDetalhadaOutput): void {
    const dadosParaModal = {
      id: transferencia.id,
      motivo: transferencia.motivo,
      dataSolicitacao: transferencia.dataSolicitacao,
      status: transferencia.status,
      tecnicoDestino: { nome: transferencia.tecnicoDestinoNome },

      // Reconstrói o objeto 'chamado' que o modal exige
      chamado: {
        id: transferencia.chamadoId,
        protocolo: transferencia.chamadoProtocolo, // O erro acontecia aqui
        titulo: transferencia.chamadoTitulo,
        descricao: transferencia.chamadoDescricao,
        prioridade: transferencia.chamadoPrioridade,
        status: transferencia.chamadoStatus,
        dataCriacao: transferencia.chamadoDataCriacao,

        // Simula o técnico responsável (que no caso de enviadas, é o usuário logado/origem)
        tecnicoResponsavel: {
          nome: 'Você',
          email: '',
        },
      },
      // Simula a origem para o modal não quebrar
      tecnicoOrigem: {
        nome: 'Você',
      },
    };

    this.dialog.open(ModalVisualizarChamadoComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dadosParaModal, // Passamos o objeto adaptado
      autoFocus: false,
    });
  }

  cancelar(t: TransferenciaDetalhadaOutput): void {
    // Abre o Dialog de Confirmação Personalizado
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        titulo: 'Cancelar Solicitação',
        mensagem: `Tem certeza que deseja cancelar o envio do chamado ${t.chamadoProtocolo}?\n\nEle voltará para sua lista de atendimentos.`,
        icone: 'delete_forever', // Ícone de lixeira
        corBotao: 'warn', // Vermelho
        textoConfirmar: 'Sim, Cancelar',
        textoCancelar: 'Voltar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.isLoading = true; // Mostra loading enquanto processa

        this.transferenciaService
          .cancelarTransferencia(this.token, t.id)
          .subscribe({
            next: () => {
              this.snackBar.open('Solicitação cancelada com sucesso.', 'OK', {
                duration: 4000,
                panelClass: ['snack-success'],
              });
              this.carregarEnviadas(); // Recarrega a lista
            },
            error: (err) => {
              this.isLoading = false;
              const msg = err.error?.message || 'Erro ao cancelar solicitação.';
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
