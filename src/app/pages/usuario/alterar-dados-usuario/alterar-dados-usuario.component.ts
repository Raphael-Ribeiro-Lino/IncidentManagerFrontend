import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './alterar-dados-usuario.component.html',
  styleUrls: ['./alterar-dados-usuario.component.css'],
})
export class AlterarDadosUsuarioComponent implements OnInit {
  formUsuario!: FormGroup;
  errorMessages: string[] = [];
  successfullyUpdatedUsuario = '';

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
      error: () =>
        this.errorMessages.push('Erro ao carregar dados do usuário.'),
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
      empresa: [usuario.empresa?.id ?? '', Validators.required],
    });
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
      this.errorMessages.push(
        'Corrija os erros do formulário antes de salvar.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
          this.successfullyUpdatedUsuario = 'Dados atualizados com sucesso!';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => this.router.navigate(['/usuario/listar']), 2000);
        },
        error: (erro) => {
          this.errorMessages.push(
            erro.error?.message ||
              'Ocorreu um erro inesperado. Tente mais tarde.'
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
  }
}
