import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecuperarSenhaService } from '../../services/recuperar-senha/recuperar-senha.service';
import { EmailRedefinirSenhaInput } from '../../models/recuperar-senha/recuperarSenhaInput';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar-senha.component.html',
  styleUrl: './recuperar-senha.component.css',
})
export class RecuperarSenhaComponent implements OnInit {
  formRecover!: FormGroup;
  errorMessages: string[] = [];
  successMessage: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private recuperarSenhaService: RecuperarSenhaService,
    private route: Router
  ) {
    this.formRecover = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
          Validators.maxLength(320),
        ],
      ],
    });
  }

  submitForm(): void {
    this.errorMessages = [];
    this.successMessage = null;
    this.loading = true;

    if (this.formRecover.invalid) {
      this.errorMessages.push('Por favor, preencha o e-mail corretamente.');
      return;
    }

    const email = this.formRecover.getRawValue() as EmailRedefinirSenhaInput;

    this.recuperarSenhaService.enviarEmailParaRedefinirSenha(email).subscribe({
      next: () => {
        this.successMessage =
          'Se o e-mail estiver cadastrado, enviaremos um link de redefinição.';
        const navigationExtras: NavigationExtras = {
          state: {
            successData: this.successMessage,
          },
        };
        this.route.navigate(['login'], navigationExtras);
      },
      error: (error) => {
        if (error?.error?.messages) {
          this.errorMessages = error.error.messages;
        } else {
          this.errorMessages.push(
            'Não foi possível enviar o link. Tente novamente mais tarde.'
          );
        }
        this.loading = false;
        setTimeout(() => {
          this.errorMessages = [];
        }, 3000);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {}
}
