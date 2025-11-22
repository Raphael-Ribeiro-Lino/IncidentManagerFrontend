import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute, NavigationExtras } from '@angular/router';

// --- Imports Material ---
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
// ------------------------

import { UsuarioService } from '../../../services/usuario/usuario.service';
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { PerfilEnum } from '../../../models/usuario/perfilEnum';
import { AuthService } from '../../../services/auth/auth.service';
import { EmpresaOutput } from '../../../models/empresa/empresaOutput';
import { UsuarioTokenOutput } from '../../../models/usuario/usuarioTokenOutput';
import { UsuarioOutput } from '../../../models/usuario/usuarioOutput';
import { UsuarioInput } from '../../../models/usuario/usuarioInput';

@Component({
  selector: 'app-alterar-dados-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule, // Necessário para o dropdown de perfil
    MatCheckboxModule, // Necessário para o campo Ativo
  ],
  templateUrl: './alterar-dados-usuario.component.html',
  styleUrls: ['./alterar-dados-usuario.component.css'], // Arquivo vazio
})
export class AlterarDadosUsuarioComponent implements OnInit {
  formUsuario!: FormGroup;
  errorMessages: string[] = [];
  successfullyUpdatedUsuario = '';

  // Controle de Loading
  isLoading = false;

  token = localStorage.getItem('token')!;
  usuarioLogado!: UsuarioTokenOutput;
  usuarioId!: number;

  empresaSelecionada: EmpresaOutput | null = null;

  perfilLabels = {
    [PerfilEnum.ADMIN_EMPRESA]: 'Administrador da Empresa',
    [PerfilEnum.USUARIO]: 'Usuário Comum',
    [PerfilEnum.TECNICO_TI]: 'Técnico de TI',
  };

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usuarioLogado = this.authService.getUsuarioLogado()!;
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.usuarioId) {
      this.errorMessages.push('ID do usuário inválido.');
      return;
    }

    this.usuarioService.buscarPorId(this.token, this.usuarioId).subscribe({
      next: (usuario) => this.initForm(usuario),
      error: (erro) => {
        if (erro.status === 0) {
          this.errorMessages.push(
            'Não foi possível conectar ao servidor. Verifique sua internet ou tente mais tarde.'
          );
          return;
        }
        if (erro.error && erro.error.message) {
          this.errorMessages.push(erro.error.message);

          // Redireciona para o LOGIN após 3 segundos para o usuário ler a mensagem
          setTimeout(() => {
            const navigationExtras: NavigationExtras = {
              state: {
                errorData: erro.error.message,
              },
            };
            this.router.navigate(['empresa/listar'], navigationExtras);
          }, 3000);
        } else {
          this.errorMessages.push('Erro ao carregar dados do usuário.');
        }
      },
    });
  }

  private initForm(usuario: UsuarioOutput) {
    this.empresaSelecionada = usuario.empresa ?? null;

    this.formUsuario = this.fb.group({
      nome: [
        usuario.nome,
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ -][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/),
        ],
      ],
      email: [
        usuario.email,
        [
          Validators.required,
          Validators.maxLength(320),
          Validators.pattern(
            /^(?=.{1,64}@)[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/
          ),
        ],
      ],
      telefone: [
        usuario.telefone,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern(/^\+?\d{0,3}?\s?\(?\d{2,3}\)?\s?\d{4,5}-?\d{4}$/),
        ],
      ],
      ativo: [usuario.ativo, Validators.required],
      perfil: [usuario.perfil, Validators.required],
      // O campo empresa existe no form para validação, mas é readonly no HTML
      empresa: [usuario.empresa?.id ?? '', Validators.required],
    });
  }

  removeErrorIndex(index: number) {
    this.errorMessages.splice(index, 1);
  }

  cancelar() {
    this.router.navigate(['/usuario/listar']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private formatarTelefone(telefone: string): string {
    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length === 11)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(
        7
      )}`;

    if (numeros.length === 10)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(
        6
      )}`;

    return numeros;
  }

  submitForm() {
    this.errorMessages = [];

    if (this.formUsuario.invalid) {
      this.formUsuario.markAllAsTouched();
      this.errorMessages.push(
        'Corrija os erros do formulário antes de salvar.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.isLoading = true; // Inicia loading

    let payload: UsuarioInput = {
      ...this.formUsuario.value,
      nome: this.formUsuario.value.nome
        ?.trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(
          (p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
        )
        .join(' '),
      telefone: this.formatarTelefone(this.formUsuario.value.telefone),
    };

    this.usuarioService
      .alterarDados(this.token, this.usuarioId, payload)
      .subscribe({
        next: () => {
          this.isLoading = false; // Para loading
          this.successfullyUpdatedUsuario = 'Dados atualizados com sucesso!';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => this.router.navigate(['/usuario/listar']), 2000);
        },
        error: (erro) => {
          this.isLoading = false; // Para loading
          this.errorMessages.push(
            erro.error?.message ||
              'Ocorreu um erro inesperado. Tente mais tarde.'
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
  }
}
