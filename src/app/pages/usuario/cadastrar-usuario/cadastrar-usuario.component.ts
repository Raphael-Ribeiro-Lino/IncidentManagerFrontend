import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { PerfilEnum } from '../../../models/usuario/perfilEnum';
import { AuthService } from '../../../services/auth/auth.service';
import { EmpresaOutput } from '../../../models/empresa/empresaOutput';
import { UsuarioTokenOutput } from '../../../models/usuario/usuarioTokenOutput';

@Component({
  selector: 'app-cadastrar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
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
  ultimaBusca = '';
  mensagemNenhumaEmpresa = '';
  usuarioLogado!: UsuarioTokenOutput;
  isLoading = false;

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
          Validators.pattern(/^(\(\d{2}\)\s\d{4,5}-\d{4}|\d{10,11})$/),
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
      if (this.usuarioLogado.empresa_id === undefined)
        throw new Error('Erro no token');

      const empresa: EmpresaOutput = {
        id: this.usuarioLogado.empresa_id,
        nome: 'Minha Empresa',
        cnpj: '',
        cidade: '',
        estado: '',
        ativo: true,
      };
      this.empresaSelecionada = empresa;
      this.formUsuario.patchValue({ empresa: empresa });
    }

    if (this.usuarioLogado.perfil === 'ADMIN') {
      this.buscarEmpresas();
    }
  }

  buscarEmpresas(search: string = '', page: number = 0) {
    this.empresaService.listar(this.token, page, search).subscribe({
      next: (data) => {
        if (page === 0) this.empresasFiltradas = data.content;
        else
          this.empresasFiltradas = [...this.empresasFiltradas, ...data.content];
      },
      error: () => {
        this.empresasFiltradas = [];
      },
    });
  }

  filtrarEmpresas(event: Event) {
    if (this.usuarioLogado.perfil === 'ADMIN_EMPRESA') return;

    const inputElement = event.target as HTMLInputElement;
    const valor = inputElement.value.trim();

    if (!valor) {
      this.formUsuario.get('empresa')?.setValue('');
      this.ultimaBusca = '';
      this.buscarEmpresas();
      return;
    }

    if (valor === this.ultimaBusca) return;

    this.ultimaBusca = valor;
    this.empresaService.listar(this.token, 0, valor).subscribe({
      next: (data) => {
        this.empresasFiltradas = data.content;
      },
      error: () => {
        this.empresasFiltradas = [];
      },
    });
  }

  selecionarEmpresa(empresa: EmpresaOutput) {
    this.empresaSelecionada = empresa;
    this.formUsuario.get('empresa')?.setValue(empresa);
  }

  onEmpresaBlur() {
    const valorAtual = this.formUsuario.get('empresa')?.value;
    if (typeof valorAtual === 'string' && valorAtual !== '') {
      this.formUsuario.get('empresa')?.setErrors({ required: true });
    }
    this.formUsuario.get('empresa')?.markAsTouched();
  }

  displayFn(empresa: EmpresaOutput): string {
    return empresa && empresa.nome ? empresa.nome : '';
  }

  cancelar() {
    this.router.navigate(['/usuario/listar']);
  }

  submitForm() {
    this.errorMessages = [];

    if (this.formUsuario.invalid) {
      return;
    }

    this.isLoading = true;

    const payload = { ...this.formUsuario.value };

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
      const nums = payload.telefone.replace(/\D/g, '');

      if (nums.length === 11) {
        payload.telefone = `(${nums.slice(0, 2)}) ${nums.slice(
          2,
          7
        )}-${nums.slice(7)}`;
      } else if (nums.length === 10) {
        payload.telefone = `(${nums.slice(0, 2)}) ${nums.slice(
          2,
          6
        )}-${nums.slice(6)}`;
      } else {
        payload.telefone = nums;
      }
    }

    if (this.usuarioLogado.perfil === 'ADMIN_EMPRESA') {
      payload.empresa = this.usuarioLogado.empresa_id;
    } else {
      if (
        payload.empresa &&
        typeof payload.empresa === 'object' &&
        payload.empresa.id
      ) {
        payload.empresa = payload.empresa.id;
      } else if (typeof payload.empresa !== 'number') {
        this.errorMessages.push('Selecione uma empresa válida da lista.');
        this.isLoading = false;
        return;
      }
    }

    this.usuarioService.cadastrar(this.token, payload).subscribe({
      next: () => {
        this.successfullyRegisteredUsuario = 'Usuário cadastrado com sucesso!';
        this.isLoading = false;
        this.formUsuario.disable();
        this.empresaSelecionada = null;

        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          this.router.navigate(['/usuario/listar']);
        }, 2000);
      },
      error: (erro) => {
        this.isLoading = false;
        this.errorMessages.push(
          erro.error?.message || 'Ocorreu um erro inesperado. Tente mais tarde.'
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }
}
