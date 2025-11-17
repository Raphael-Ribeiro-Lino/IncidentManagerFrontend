import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { PerfilEnum } from '../../../models/usuario/PerfilEnum';
import { AuthService } from '../../../services/auth/auth.service';
import { EmpresaOutput } from '../../../models/empresa/empresaOutput';
import { UsuarioTokenOutput } from '../../../models/usuario/usuarioTokenOutput';

@Component({
  selector: 'app-cadastrar-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cadastrar-usuario.component.html',
  styleUrls: ['./cadastrar-usuario.component.css'],
})
export class CadastrarUsuarioComponent implements OnInit {
  perfilLabels: Record<PerfilEnum, string> = {
    [PerfilEnum.ADMIN_EMPRESA]: 'Administrador da Empresa',
    [PerfilEnum.USUARIO]: 'Usuário Comum',
    [PerfilEnum.TECNICO_TI]: 'Técnico de TI',
  };

  formUsuario!: FormGroup;
  errorMessages: string[] = [];
  successfullyRegisteredUsuario = '';
  token = localStorage.getItem('token') as string;
  perfis: PerfilEnum[] = Object.values(PerfilEnum);

  empresaSelecionada: EmpresaOutput | null = null;
  empresasFiltradas: EmpresaOutput[] = [];
  mostrarDropdown = false;
  ultimaBusca = '';
  mensagemNenhumaEmpresa = '';
  usuarioLogado!: UsuarioTokenOutput;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioLogado = this.authService.getUsuarioLogado()!;
    const formConfig: any = {
      nome: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ -][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.maxLength(320),
          Validators.pattern(
            /^(?=.{1,64}@)[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/
          ),
        ],
      ],
      telefone: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern(/^\+?\d{0,3}?\s?\(?\d{2,3}\)?\s?\d{4,5}-?\d{4}$/),
        ],
      ],
      ativo: [true, Validators.required],
      perfil: ['', Validators.required],
    };

    if (this.usuarioLogado.perfil !== 'ADMIN_EMPRESA') {
      formConfig.empresa = ['', Validators.required];
    } else {
      formConfig.empresa = [''];
    }

    this.formUsuario = this.formBuilder.group(formConfig);

    if (this.usuarioLogado.perfil === 'ADMIN_EMPRESA') {
      if (this.usuarioLogado.empresa_id === undefined) {
        throw new Error(
          'Usuário ADM_EMPRESA não possui empresa_id definido no token!'
        );
      }
      const empresa: EmpresaOutput = {
        id: this.usuarioLogado.empresa_id,
        nome: 'Minha Empresa',
        cnpj: '',
        cidade: '',
        estado: '',
        ativo: true,
      };
      this.empresaSelecionada = empresa;
      this.formUsuario.patchValue({ empresa: empresa.id });
    }

    if (this.usuarioLogado.perfil === 'ADMIN') {
      this.buscarEmpresas();
    }
  }

  buscarEmpresas(search: string = '', page: number = 0) {
    this.empresaService.listar(this.token, page, search).subscribe({
      next: (data) => {
        if (page === 0) this.empresasFiltradas = data.content;
        else this.empresasFiltradas = [...this.empresasFiltradas, ...data.content];
        this.mensagemNenhumaEmpresa =
          this.empresasFiltradas.length === 0 ? 'Nenhuma empresa encontrada.' : '';
      },
      error: () => {
        this.empresasFiltradas = [];
        this.mensagemNenhumaEmpresa = 'Nenhuma empresa encontrada.';
      },
    });
  }

  filtrarEmpresas(event: Event) {
    if (this.usuarioLogado.perfil === 'ADMIN_EMPRESA') return;
    const valor = (event.target as HTMLInputElement).value.trim();
    if (!valor) {
      this.ultimaBusca = '';
      this.buscarEmpresas();
      this.mostrarDropdown = true;
      return;
    }
    if (valor === this.ultimaBusca) return;
    this.ultimaBusca = valor;
    this.empresaService.listar(this.token, 0, valor).subscribe({
      next: (data) => {
        this.empresasFiltradas = data.content;
        this.mostrarDropdown = true;
        this.mensagemNenhumaEmpresa =
          this.empresasFiltradas.length === 0 ? 'Nenhuma empresa encontrada.' : '';
      },
      error: () => {
        this.empresasFiltradas = [];
        this.mensagemNenhumaEmpresa = 'Nenhuma empresa encontrada.';
      },
    });
  }

  selecionarEmpresa(empresa: EmpresaOutput) {
    this.empresaSelecionada = empresa;
    this.formUsuario.get('empresa')?.setValue(empresa.id);
    this.formUsuario.get('empresa')?.markAsTouched();
    this.mostrarDropdown = false;
  }

  fecharDropdown() {
    setTimeout(() => (this.mostrarDropdown = false), 150);
  }

  cancelar() {
    this.router.navigate(['/usuario/listar']);
  }

  submitForm() {
    this.errorMessages = [];
    const usuarioInput = { ...this.formUsuario.value };

    if (usuarioInput.nome) {
      usuarioInput.nome = usuarioInput.nome
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(
          (palavra: string) =>
            palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
        )
        .join(' ');
    }

    if (usuarioInput.telefone) {
      const numeros = usuarioInput.telefone.replace(/\D/g, '');
      if (numeros.length === 11) {
        usuarioInput.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(
          2,
          7
        )}-${numeros.slice(7)}`;
      } else if (numeros.length === 10) {
        usuarioInput.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(
          2,
          6
        )}-${numeros.slice(6)}`;
      } else {
        usuarioInput.telefone = numeros;
      }
    }

    if (this.usuarioLogado.perfil === 'ADMIN_EMPRESA') {
      usuarioInput.empresa = this.usuarioLogado.empresa_id;
    }

    this.usuarioService.cadastrar(this.token, usuarioInput).subscribe({
      next: () => {
        this.successfullyRegisteredUsuario = 'Usuário cadastrado com sucesso!';
        this.formUsuario.reset({ ativo: true });
        this.empresaSelecionada = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          this.router.navigate(['/usuario/listar']);
        }, 2000);
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
