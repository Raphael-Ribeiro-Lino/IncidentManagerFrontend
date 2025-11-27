import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-modal-alterar-status',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  templateUrl: './modal-alterar-status.component.html',
  styleUrl: './modal-alterar-status.component.css',
})
export class ModalAlterarStatusComponent {
  form: FormGroup;
  listaStatus = [
    { value: 'TRIAGEM', label: 'Triagem' },
    { value: 'EM_ATENDIMENTO', label: 'Em Atendimento' },
    { value: 'AGUARDANDO_CLIENTE', label: 'Aguardando Cliente' },
    { value: 'AGUARDANDO_PECA', label: 'Aguardando Peça' },
    { value: 'RESOLVIDO', label: 'Resolvido' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalAlterarStatusComponent>
  ) {
    this.form = this.fb.group({
      status: ['', Validators.required],
      observacao: ['', [Validators.required, Validators.maxLength(2000)]],
      visivelCliente: [true, Validators.required],
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  confirmar(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
