import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
// --- Imports Material ---
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
// ------------------------
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { AlteraSenhaInput } from '../../../models/usuario/alteraSenhaInput';

@Component({
  selector: 'app-altera-senha',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatFormFieldModule, // Adicionado
    MatInputModule,     // Adicionado
    MatButtonModule,    // Adicionado
    MatIconModule       // Adicionado
  ],
  templateUrl: './alterar-senha.component.html',
  styleUrl: './alterar-senha.component.css', // Certifique-se de que este arquivo existe e está vazio
})
export class AlterarSenhaComponent implements OnInit {
  formAlteraSenha!: FormGroup;
  errorMessages: string[] = [];
  successMessage = '';
  
  isLoading = false; // Controle de Loading

  showPassword = {
    senhaAtual: false,
    novaSenha: false,
    repetirNovaSenha: false,
  };

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formAlteraSenha = this.formBuilder.group(
      {
        senhaAtual: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],

        novaSenha: [
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

        repetirNovaSenha: [
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
      { validators: this.passwordsMatchValidator }
    );
  }

  togglePassword(field: 'senhaAtual' | 'novaSenha' | 'repetirNovaSenha') {
    this.showPassword[field] = !this.showPassword[field];
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const nova = group.get('novaSenha')?.value;
    const repetir = group.get('repetirNovaSenha')?.value;

    if (nova && repetir && nova !== repetir) {
      group.get('repetirNovaSenha')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    const repetirControl = group.get('repetirNovaSenha');
    if (repetirControl?.hasError('passwordMismatch')) {
      repetirControl.setErrors(null);
    }

    return null;
  }

  // Remove erro individual da lista
  removeErrorIndex(index: number) {
    this.errorMessages.splice(index, 1);
  }

  cancelar() {
    // Ajustado para voltar para Home ou Meus Dados, conforme preferência
    this.router.navigate(['/usuario/alterar-meus-dados']); 
  }

  submitForm(): void {
    this.errorMessages = [];
    
    if (this.formAlteraSenha.invalid) {
        this.formAlteraSenha.markAllAsTouched();
        return;
    }

    const token = localStorage.getItem('token')!;
    const input: AlteraSenhaInput = this.formAlteraSenha.value;
    
    this.isLoading = true; // Inicia loading

    this.usuarioService.alterarSenha(token, input).subscribe({
      next: () => {
        this.isLoading = false; // Para loading
        this.successMessage = 'Senha alterada com sucesso! Faça login novamente.';
        this.formAlteraSenha.disable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (erro) => {
        this.isLoading = false; // Para loading
        this.errorMessages.push(
          erro.error?.message || 'Ocorreu um erro inesperado. Tente novamente.'
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }
}