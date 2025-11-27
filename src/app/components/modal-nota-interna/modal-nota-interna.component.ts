import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-modal-nota-interna',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './modal-nota-interna.component.html',
  styleUrl: './modal-nota-interna.component.css',
})
export class ModalNotaInternaComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalNotaInternaComponent>
  ) {
    this.form = this.fb.group({
      texto: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  cancelar(): void {
    this.dialogRef.close(); // Fecha sem retornar nada
  }

  confirmar(): void {
    if (this.form.valid) {
      // Retorna o texto para quem abriu o modal (a tela de detalhes)
      this.dialogRef.close(this.form.value.texto);
    }
  }
}
