import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modal-avaliacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './modal-avaliacao.component.html',
  styleUrl: './modal-avaliacao.component.css'
})
export class ModalAvaliacaoComponent {
  form: FormGroup;
  rating: number = 0; // Controle visual da nota
  stars: number[] = [1, 2, 3, 4, 5]; // Array para gerar as 5 estrelas

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalAvaliacaoComponent>
  ) {
    this.form = this.fb.group({
      nota: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.maxLength(1000)]] // Opcional no backend, mas com limite
    });
  }

  // Função chamada ao clicar na estrela
  setRating(star: number): void {
    this.rating = star;
    this.form.patchValue({ nota: star });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  confirmar(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched(); // Mostra erro se tentar enviar sem nota
    }
  }
}