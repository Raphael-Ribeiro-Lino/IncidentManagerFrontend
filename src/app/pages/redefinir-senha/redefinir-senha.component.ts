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
// --- Imports do Material ---
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
// ---------------------------
import {
  ActivatedRoute,
  NavigationExtras,
  Router,
  RouterModule,
} from '@angular/router';
import { RedefinirSenhaService } from '../../services/redefinir-senha/redefinir-senha.service';
import { RedefinirSenhaInput } from '../../models/redefinir-senha/redefinirSenhaInput';

@Component({
  selector: 'app-redefinir-senha',
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
  templateUrl: './redefinir-senha.component.html',
  styleUrl: './redefinir-senha.component.css',
})
export class RedefinirSenhaComponent implements OnInit {
  formRedefinePassword: FormGroup;
  errorMessages: string[] = [];
  successMessage: string = '';
  showPassword = { newPassword: false, confirmPassword: false };

  // Variável de controle de carregamento
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private redefinirSenhaService: RedefinirSenhaService,
    private route: Router
  ) {
    this.formRedefinePassword = this.formBuilder.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(255),
            // Mantendo seu Regex de segurança
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

  // Validação personalizada mantida
  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;

    if (password && confirm && password !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Limpa o erro se corrigiu
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

    // Verifica se o hash é válido ao carregar a página
    this.redefinirSenhaService.verificaHash(hash).subscribe({
      error: (erro) => {
        this.formRedefinePassword.disable(); // Trava o form em qualquer erro

        // CASO 1: Erro de conexão / API fora do ar (Status 0)
        if (erro.status === 0) {
          this.errorMessages.push(
            'Não foi possível conectar ao servidor. Verifique sua internet ou tente mais tarde.'
          );
          return;
        }

        // CASO 2: O Backend mandou uma mensagem específica (ex: "Hash expirado")
        if (erro.error && erro.error.message) {
          this.errorMessages.push(erro.error.message);

          // Redireciona de volta para pedir o email novamente
          setTimeout(() => {
            const navigationExtras: NavigationExtras = {
              state: { successData: this.errorMessages.join(', ') },
            };
            this.route.navigate(['recuperar-senha'], navigationExtras);
          }, 3000);
        }
        // CASO 3: Erro genérico não tratado
        else {
          this.errorMessages.push(
            'Link inválido ou expirado. Tente solicitar novamente.'
          );
        }
      },
    });
  }

  submitForm(): void {
    if (this.formRedefinePassword.invalid) return;

    const hash = this.activatedRoute.snapshot.paramMap.get('hash');
    this.errorMessages = [];
    this.isLoading = true; // Ativa loading

    const redefinirSenhaInput: RedefinirSenhaInput = {
      senha: this.formRedefinePassword.value.newPassword,
      repetirSenha: this.formRedefinePassword.value.confirmPassword,
    };

    this.redefinirSenhaService
      .redefinirSenha(redefinirSenhaInput, hash)
      .subscribe({
        next: () => {
          this.successMessage = 'Senha alterada com sucesso!';
          // Pequeno delay para usuário ler a mensagem antes de redirecionar
          setTimeout(() => {
            const navigationExtras: NavigationExtras = {
              state: { successData: `Senha alterada com sucesso! Faça login.` },
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
              'Ocorreu um erro inesperado. Tente mais tarde.'
            );
          }
        },
        complete: () => {
          // Se não redirecionasse no next, pararia o loading aqui
        },
      });
  }
}
