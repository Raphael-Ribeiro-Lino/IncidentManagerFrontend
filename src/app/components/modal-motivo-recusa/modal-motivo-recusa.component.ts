import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-modal-motivo-recusa',
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
  templateUrl: './modal-motivo-recusa.component.html',
  styleUrl: './modal-motivo-recusa.component.css',
})
export class ModalMotivoRecusaComponent {
  motivoControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
  ]);

  constructor(public dialogRef: MatDialogRef<ModalMotivoRecusaComponent>) {}

  cancelar(): void {
    this.dialogRef.close();
  }

  confirmar(): void {
    if (this.motivoControl.valid) {
      this.dialogRef.close(this.motivoControl.value);
    }
  }
}
