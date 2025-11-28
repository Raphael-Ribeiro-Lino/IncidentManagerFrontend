import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  transferencias: TransferenciaOutput[] = [];

  page: number = 0;
  totalPages: number = 0;
  totalElementos: number = 0;

  busca: string = '';
  private searchSubject = new Subject<string>();

  isLoading: boolean = false;
  token = localStorage.getItem('token')!;

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
          this.snackBar.open('Erro ao carregar histórico.', 'Fechar', {
            duration: 3000,
            panelClass: ['snack-error'],
          });
        },
      });
  }

  paginar(page: number): void {
    this.page = page;
    this.carregarEnviadas();
  }

  verChamado(transferencia: TransferenciaOutput): void {
    this.dialog.open(ModalVisualizarChamadoComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: transferencia,
      autoFocus: false,
    });
  }

  // Opcional: Implementar cancelamento se estiver pendente
  cancelar(t: TransferenciaOutput): void {
    // if (
    //   !confirm(
    //     'Deseja cancelar esta solicitação? O chamado voltará para sua lista.'
    //   )
    // )
    //   return;

    // this.transferenciaService
    //   .cancelarTransferencia(this.token, t.id)
    //   .subscribe({
    //     next: () => {
    //       this.snackBar.open('Solicitação cancelada.', 'OK', {
    //         panelClass: ['snack-success'],
    //       });
    //       this.carregarEnviadas();
    //     },
    //     error: () =>
    //       this.snackBar.open('Erro ao cancelar.', 'Fechar', {
    //         panelClass: ['snack-error'],
    //       }),
    //   });
  }
}
