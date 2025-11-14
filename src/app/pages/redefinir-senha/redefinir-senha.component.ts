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
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './redefinir-senha.component.html',
  styleUrl: './redefinir-senha.component.css',
})
export class RedefinirSenhaComponent implements OnInit {
  formRedefinePassword: FormGroup;
  showErrorMessages: boolean = false;
  errorMessages: string[] = [];
  successMessage: string = '';
  showPassword = { newPassword: false, confirmPassword: false };

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
    this.redefinirSenhaService.verificaHash(hash).subscribe({
      error: (erro) => {
        if (erro.error && erro.error.message) {
          this.errorMessages.push(erro.error.message);
          this.formRedefinePassword.get('newPassword')?.disable();
          this.formRedefinePassword.get('confirmPassword')?.disable();
          setTimeout(() => {
            const navigationExtras: NavigationExtras = {
              state: {
                successData: this.errorMessages.join(', '), // passa a mensagem
              },
            };
            this.route.navigate(['recuperar-senha'], navigationExtras);
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
    if (this.formRedefinePassword.invalid) return;

    const hash = this.activatedRoute.snapshot.paramMap.get('hash');
    this.errorMessages = [];

    const redefinirSenhaInput: RedefinirSenhaInput = {
      senha: this.formRedefinePassword.value.newPassword,
      repetirSenha: this.formRedefinePassword.value.confirmPassword
    }

    this.redefinirSenhaService.redefinirSenha(redefinirSenhaInput, hash).subscribe({
      next: () => {
        const navigationExtras: NavigationExtras = { state: { successData: `Senha alterada com sucesso!` } }
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
