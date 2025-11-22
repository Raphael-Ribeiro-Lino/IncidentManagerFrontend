import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
// --- Imports Material ---
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
// ------------------------
import {
  ActivatedRoute,
  NavigationExtras,
  Router,
  RouterModule,
} from '@angular/router';
import { DefinirSenhaService } from '../../services/definir-senha/definir-senha.service';
import { RedefinirSenhaInput } from '../../models/redefinir-senha/redefinirSenhaInput';

@Component({
  selector: 'app-definir-senha',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatFormFieldModule, // Adicionado
    MatInputModule, // Adicionado
    MatButtonModule, // Adicionado
  ],
  templateUrl: './definir-senha.component.html',
  styleUrl: './definir-senha.component.css',
})
export class DefinirSenhaComponent implements OnInit {
  formDefinePassword: FormGroup;
  errorMessages: string[] = [];
  successMessage: string = '';
  showPassword = { newPassword: false, confirmPassword: false };

  isLoading = false; // Controle de loading

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private definirSenhaService: DefinirSenhaService,
    private route: Router
  ) {
    this.formDefinePassword = this.formBuilder.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(255),
            Validators.pattern(
              '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],
        confirmPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(255),
          ],
        ],
      },
      {
        validators: this.passwordsMatchValidator,
      }
    );
  }

  togglePassword(field: 'newPassword' | 'confirmPassword'): void {
    this.showPassword[field] = !this.showPassword[field];
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;

    if (password && confirm && password !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = group.get('confirmPassword')?.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          group.get('confirmPassword')?.setErrors(null);
        }
      }
      return null;
    }
  }

  ngOnInit(): void {
    const hash = this.activatedRoute.snapshot.paramMap.get('hash');

    this.definirSenhaService.verificaHash(hash).subscribe({
      error: (erro) => {
        this.formDefinePassword.disable(); // 1. Trava o formulário imediatamente

        // CASO 1: Erro de conexão / API fora do ar (Status 0)
        if (erro.status === 0) {
          this.errorMessages.push(
            'Não foi possível conectar ao servidor. Verifique sua internet ou tente mais tarde.'
          );
          return;
        }

        // CASO 2: O Backend mandou uma mensagem específica (ex: "Convite expirado", "Link já usado")
        if (erro.error && erro.error.message) {
          this.errorMessages.push(erro.error.message);

          // Redireciona para o LOGIN após 3 segundos para o usuário ler a mensagem
          setTimeout(() => {
            const navigationExtras: NavigationExtras = {
              state: {
                // Passamos como 'errorData' para o Login saber que deve mostrar um alerta vermelho
                errorData: erro.error.message,
              },
            };
            this.route.navigate(['login'], navigationExtras);
          }, 3000);
        }
        // CASO 3: Erro genérico não tratado (404, 500 sem mensagem)
        else {
          this.errorMessages.push(
            'Link inválido ou expirado. Entre em contato com o administrador para solicitar um novo convite.'
          );
        }
      },
    });
  }

  submitForm(): void {
    if (this.formDefinePassword.invalid) return;

    const hash = this.activatedRoute.snapshot.paramMap.get('hash');
    this.errorMessages = [];
    this.isLoading = true; // Inicia loading

    const definirSenhaInput: RedefinirSenhaInput = {
      senha: this.formDefinePassword.value.newPassword,
      repetirSenha: this.formDefinePassword.value.confirmPassword,
    };

    this.definirSenhaService.definirSenha(definirSenhaInput, hash).subscribe({
      next: () => {
        this.successMessage = 'Senha definida com sucesso!';

        setTimeout(() => {
          const navigationExtras: NavigationExtras = {
            state: { successData: `Senha definida com sucesso! Faça login.` },
          };
          this.route.navigate(['login'], navigationExtras);
        }, 1500);
      },
      error: (erro) => {
        this.isLoading = false; // Para loading
        if (erro.error && erro.error.message) {
          this.errorMessages.push(erro.error.message);
        } else {
          this.errorMessages.push(
            'Ocorreu um erro inesperado. Tente mais tarde, por favor!'
          );
        }
      },
    });
  }
}
