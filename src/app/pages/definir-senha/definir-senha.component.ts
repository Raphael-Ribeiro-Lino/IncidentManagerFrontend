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
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationExtras, Router, RouterModule } from '@angular/router';
import { DefinirSenhaService } from '../../services/definir-senha/definir-senha.service';
import { RedefinirSenhaInput } from '../../models/redefinir-senha/redefinirSenhaInput';

@Component({
  selector: 'app-definir-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './definir-senha.component.html',
  styleUrl: './definir-senha.component.css',
})
export class DefinirSenhaComponent implements OnInit {
  formDefinePassword: FormGroup;
  showErrorMessages: boolean = false;
  errorMessages: string[] = [];
  successMessage: string = '';
  showPassword = { newPassword: false, confirmPassword: false };

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
            Validators.pattern(
              '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            ),
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
            if (erro.error && erro.error.message) {
              this.errorMessages.push(erro.error.message);
              this.formDefinePassword.get('newPassword')?.disable();
              this.formDefinePassword.get('confirmPassword')?.disable();
              setTimeout(() => {
                const navigationExtras: NavigationExtras = {
                  state: {
                    errorData: erro.error.message,
                  },
                };
                this.route.navigate(['login'], navigationExtras);
              }, 2000);
            } else {
              this.errorMessages.push(
                'Ocorreu um erro inesperado. Tente mais tarde, por favor!'
              );
            }
          },
        });
  }

    submitForm(): void {
      if (this.formDefinePassword.invalid) return;
  
      const hash = this.activatedRoute.snapshot.paramMap.get('hash');
      this.errorMessages = [];
  
      const definirSenhaInput: RedefinirSenhaInput = {
        senha: this.formDefinePassword.value.newPassword,
        repetirSenha: this.formDefinePassword.value.confirmPassword
      }
  
      this.definirSenhaService.definirSenha(definirSenhaInput, hash).subscribe({
        next: () => {
          const navigationExtras: NavigationExtras = { state: { successData: `Senha definida com sucesso!` } }
          this.route.navigate(['login'], navigationExtras)
        },
        error: (erro) => {
          if (erro.error && erro.error.message) {
            this.errorMessages.push(erro.error.message);
          } else {
            this.errorMessages.push('Ocorreu um erro inesperado. Tente mais tarde, por favor!');
          }
        }
      });
    }
}
