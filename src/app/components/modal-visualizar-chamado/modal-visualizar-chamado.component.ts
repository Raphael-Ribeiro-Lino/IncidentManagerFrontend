import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TransferenciaOutput } from '../../models/transferencia/transferenciaOutput';

@Component({
  selector: 'app-modal-visualizar-chamado',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
  ],
  templateUrl: './modal-visualizar-chamado.component.html',
  styleUrls: ['./modal-visualizar-chamado.component.css'],
})
export class ModalVisualizarChamadoComponent {
  prioridadeLabels: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };

  constructor(
    public dialogRef: MatDialogRef<ModalVisualizarChamadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TransferenciaOutput
  ) {}

  fechar(): void {
    this.dialogRef.close();
  }
}
