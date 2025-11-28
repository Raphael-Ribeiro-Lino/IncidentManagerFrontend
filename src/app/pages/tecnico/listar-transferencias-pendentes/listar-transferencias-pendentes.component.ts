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
          this.snackBar.open('Erro ao carregar transferências.', 'Fechar', {
            duration: 3000,
            panelClass: ['snack-error']
          });
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
      autoFocus: false
    });
  }

  // --- Ações ---

  aceitar(t: TransferenciaOutput): void {
    // if (!confirm(`Deseja aceitar o chamado ${t.chamado.protocolo}?`)) return;

    // this.isLoading = true;
    // this.transferenciaService.aceitarTransferencia(this.token, t.id).subscribe({
    //   next: () => {
    //     this.snackBar.open(
    //       'Chamado aceito! Verifique sua lista "Meus Chamados".',
    //       'OK',
    //       { duration: 5000, panelClass: ['snack-success'] }
    //     );
    //     this.carregarPendencias();
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.isLoading = false;
    //     this.snackBar.open('Erro ao aceitar.', 'Fechar', {
    //       duration: 4000,
    //       panelClass: ['snack-error'],
    //     });
    //   },
    // });
  }

  recusar(t: TransferenciaOutput): void {
    // if (!confirm(`Deseja RECUSAR o chamado ${t.chamado.protocolo}?`)) return;

    // this.isLoading = true;
    // this.transferenciaService.recusarTransferencia(this.token, t.id).subscribe({
    //   next: () => {
    //     this.snackBar.open('Transferência recusada.', 'OK', { duration: 4000 });
    //     this.carregarPendencias();
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.isLoading = false;
    //     this.snackBar.open('Erro ao recusar.', 'Fechar', {
    //       duration: 4000,
    //       panelClass: ['snack-error'],
    //     });
    //   },
    // });
  }
}