import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

// Material Modules
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
import { ModalVisualizarChamadoComponent } from '../../../components/modal-visualizar-chamado/modal-visualizar-chamado.component';
import { ResponderTransferenciaInput } from '../../../models/transferencia/responderTransferenciaInput';
import { ModalMotivoRecusaComponent } from '../../../components/modal-motivo-recusa/modal-motivo-recusa.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';

// Components & Services
// Ajuste o caminho relativo conforme a estrutura de pastas real do seu projeto

@Component({
  selector: 'app-listar-transferencias-pendentes',
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
  templateUrl: './listar-transferencias-pendentes.component.html',
  styleUrl: './listar-transferencias-pendentes.component.css',
})
export class ListarTransferenciasPendentesComponent implements OnInit {
  // Emite evento para o componente pai atualizar o badge da aba
  @Output() listaAtualizada = new EventEmitter<void>();

  transferencias: TransferenciaOutput[] = [];

  page: number = 0;
  totalPages: number = 0;
  totalElementos: number = 0;

  busca: string = '';
  private searchSubject = new Subject<string>();

  isLoading: boolean = false;
  token = localStorage.getItem('token')!;

  loadingFailed = false;
  errorMessages: string[] = [];

  prioridadeLabels: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };

  constructor(
    private transferenciaService: TransferenciaService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.searchSubject.pipe(debounceTime(400)).subscribe((term) => {
      this.busca = term;
      this.page = 0;
      this.carregarPendencias();
    });
  }

  ngOnInit(): void {
    this.carregarPendencias();
  }

  onSearchInput(term: string): void {
    this.searchSubject.next(term);
  }

  carregarPendencias(): void {
    this.isLoading = true;
    this.loadingFailed = false; // Reseta erro anterior
    this.errorMessages = []; // Limpa mensagens

    this.transferenciaService
      .listarMinhasPendencias(this.token, this.page, this.busca)
      .subscribe({
        next: (response) => {
          this.transferencias = response.content;
          this.totalPages = response.page.totalPages;
          this.totalElementos = response.page.totalElements;
          this.isLoading = false;

          // Avisa o pai que a lista mudou (para atualizar contador)
          this.listaAtualizada.emit();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.loadingFailed = true;
          this.errorMessages = [
            'Não foi possível carregar as solicitações. Verifique sua conexão ou tente novamente mais tarde.',
          ];
        },
      });
  }

  paginar(page: number): void {
    this.page = page;
    this.carregarPendencias();
  }

  // Abre o Modal de Visualização (Read-Only)
  verChamado(transferencia: TransferenciaOutput): void {
    this.dialog.open(ModalVisualizarChamadoComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: transferencia,
      autoFocus: false,
    });
  }

  // --- Ações ---

  aceitar(t: TransferenciaOutput): void {
    // Abre o Dialog de Confirmação
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      disableClose: true, // Obriga a clicar em um botão
      data: {
        titulo: 'Aceitar Transferência',
        mensagem: `Deseja assumir a responsabilidade pelo chamado <b>${t.chamado.protocolo}</b>?\n\nEle será movido para sua lista de "Meus Atendimentos".`,
        icone: 'check_circle', // Ícone de sucesso
        corBotao: 'accent', // Usa a classe .accent (Verde) do seu CSS
        textoConfirmar: 'Sim, Aceitar',
        textoCancelar: 'Cancelar',
      },
    });

    // Escuta o fechamento
    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.isLoading = true;

        const input: ResponderTransferenciaInput = {
          aceito: true,
          motivoRecusa: undefined,
        };

        this.transferenciaService
          .responderTransferencia(this.token, t.id, input)
          .subscribe({
            next: () => {
              this.snackBar.open('Chamado aceito com sucesso!', 'OK', {
                duration: 5000,
                panelClass: ['snack-success'],
              });
              this.listaAtualizada.emit();
              this.router.navigate(['/tecnico/atendimento/listar'], {
                queryParams: { tab: 0 },
              });
            },
            error: (err) => {
              this.isLoading = false;
              const msg =
                err.error?.message || 'Erro ao aceitar transferência.';
              this.snackBar.open(msg, 'Fechar', {
                duration: 4000,
                panelClass: ['snack-error'],
              });
            },
          });
      }
    });
  }

  recusar(t: TransferenciaOutput): void {
    // 1. Abre o modal para pedir o motivo
    const dialogRef = this.dialog.open(ModalMotivoRecusaComponent, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((motivo: string) => {
      // Se retornou string, o usuário confirmou e digitou algo
      if (motivo) {
        this.isLoading = true;

        const input: ResponderTransferenciaInput = {
          aceito: false,
          motivoRecusa: motivo,
        };

        this.transferenciaService
          .responderTransferencia(this.token, t.id, input)
          .subscribe({
            next: () => {
              this.snackBar.open('Transferência recusada.', 'OK', {
                duration: 4000,
                panelClass: ['snack-success'],
              });
              this.carregarPendencias();
            },
            error: (err) => {
              console.error(err);
              this.isLoading = false;
              const msg =
                err.error?.message || 'Erro ao recusar transferência.';
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
