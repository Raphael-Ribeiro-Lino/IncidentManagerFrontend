import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PerfilEnum } from '../../../models/usuario/perfilEnum';
import { EmpresaOutput } from '../../../models/empresa/empresaOutput';
import { UsuarioTokenOutput } from '../../../models/usuario/usuarioTokenOutput';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UsuarioOutput } from '../../../models/usuario/usuarioOutput';
import { AlteraMeusDadosInput } from '../../../models/usuario/alteraMeusDadosInput';

@Component({
  selector: 'app-alterar-meus-dados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './alterar-meus-dados.component.html',
  styleUrl: './alterar-meus-dados.component.css',
})
export class AlterarMeusDadosComponent implements OnInit {
  perfilLabels: Record<PerfilEnum, string> = {
    [PerfilEnum.ADMIN_EMPRESA]: 'Administrador da Empresa',
    [PerfilEnum.USUARIO]: 'Usuário Comum',
    [PerfilEnum.TECNICO_TI]: 'Técnico de TI',
  };

  formUsuario!: FormGroup;
  errorMessages: string[] = [];
  successfullyUpdatedUsuario = '';
  token = localStorage.getItem('token') as string;
  perfis: PerfilEnum[] = Object.values(PerfilEnum);

  empresaSelecionada: EmpresaOutput | null = null;
  empresasFiltradas: EmpresaOutput[] = [];
  mostrarDropdown = false;
  ultimaBusca = '';
  mensagemNenhumaEmpresa = '';
  usuarioLogado!: UsuarioTokenOutput;
  usuarioId!: number;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usuarioLogado = this.authService.getUsuarioLogado()!;

    this.usuarioService.buscarPorToken(this.token).subscribe({
      next: (usuario: UsuarioOutput) => {
        this.initForm(usuario);
      },
      error: () => {
        this.errorMessages.push('Erro ao carregar dados do usuário.');
      },
    });
  }

  private initForm(usuario: UsuarioOutput) {
    const formConfig: any = {
      nome: [
        usuario.nome || '',
        [Validators.required, Validators.maxLength(100), Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ -][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/)],
      ],
      email: [
        usuario.email || '',
        [
          Validators.required,
          Validators.maxLength(320),
          Validators.pattern(
            /^(?=.{1,64}@)[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/
          ),
        ],
      ],
      telefone: [
        usuario.telefone || '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern(/^\+?\d{0,3}?\s?\(?\d{2,3}\)?\s?\d{4,5}-?\d{4}$/),
        ],
      ],
    };

    this.formUsuario = this.formBuilder.group(formConfig);
  }

  cancelar() {
    this.router.navigate(['/home']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const payload: AlteraMeusDadosInput = { ...this.formUsuario.value };

    if (payload.nome) {
      payload.nome = payload.nome
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(
          (p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
        )
        .join(' ');
    }

    if (payload.telefone) {
      const numeros = payload.telefone.replace(/\D/g, '');
      if (numeros.length === 11)
        payload.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(
          2,
          7
        )}-${numeros.slice(7)}`;
      else if (numeros.length === 10)
        payload.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(
          2,
          6
        )}-${numeros.slice(6)}`;
      else payload.telefone = numeros;
    }

    this.usuarioService.alterarMeusDados(this.token, payload).subscribe({
      next: () => {
        this.successfullyUpdatedUsuario = 'Dados atualizados com sucesso!';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => this.router.navigate(['/home']), 2000);
      },
      error: (erro) => {
        this.errorMessages.push(
          erro.error?.message || 'Ocorreu um erro inesperado. Tente mais tarde.'
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }
}
