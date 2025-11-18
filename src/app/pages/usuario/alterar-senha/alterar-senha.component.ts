import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { AlteraSenhaInput } from '../../../models/usuario/alteraSenhaInput';

@Component({
  selector: 'app-altera-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './alterar-senha.component.html',
  styleUrls: ['./alterar-senha.component.css']
})
export class AlterarSenhaComponent implements OnInit {

  formAlteraSenha!: FormGroup;
  errorMessages: string[] = [];
  successMessage = '';

  showPassword = {
    senhaAtual: false,
    novaSenha: false,
    repetirNovaSenha: false
  };

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formAlteraSenha = this.formBuilder.group(
      {
        senhaAtual: ['', [Validators.required]],

        novaSenha: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(255),
            Validators.pattern(
              '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            )
          ]
        ],

        repetirNovaSenha: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(255),
            Validators.pattern(
              '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            )
          ]
        ]
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

    return null;
  }

  cancelar() {
    this.router.navigate(['/usuario/meus-dados']);
  }

  submitForm(): void {
    if (this.formAlteraSenha.invalid) return;

    const token = localStorage.getItem('token')!;
    this.errorMessages = [];

    const input: AlteraSenhaInput = this.formAlteraSenha.value;

    this.usuarioService.alterarSenha(token, input).subscribe({
      next: () => {
        this.successMessage = 'Senha alterada com sucesso!';
        this.formAlteraSenha.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (erro) => {
        this.errorMessages.push(
          erro.error?.message || 'Ocorreu um erro inesperado. Tente novamente.'
        );
      }
    });
  }
}
