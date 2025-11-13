import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecuperarSenhaService } from '../../services/recuperar-senha/recuperar-senha.service';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterModule],
  templateUrl: './recuperar-senha.component.html',
  styleUrl: './recuperar-senha.component.css'
})
export class RecuperarSenhaComponent implements OnInit {
  formRecover!: FormGroup;
  errorMessages: string[] = [];
  successMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private recuperarSenhaService: RecuperarSenhaService,
    private router: Router
  ) {
    this.formRecover = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        ],
      ],
    });
  }

  submitForm(): void {
    this.errorMessages = [];
    this.successMessage = null;

    if (this.formRecover.invalid) {
      this.errorMessages.push('Por favor, preencha o e-mail corretamente.');
      return;
    }

    this.isLoading = true;

    const email = this.formRecover.value.email;

    this.recuperarSenhaService.enviarEmailParaRedefinirSenha(email).subscribe({
      next: () => {
        this.successMessage =
          'E-mail enviado com sucesso! Verifique sua caixa de entrada.';
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error?.error?.messages) {
          this.errorMessages = error.error.messages;
        } else {
          this.errorMessages.push(
            'Não foi possível enviar o link. Tente novamente mais tarde.'
          );
        }
      },
    });
  }

  ngOnInit(): void {
  }

}
