import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { PerfilEnum } from '../../../models/usuario/perfilEnum';
import { AuthService } from '../../../services/auth/auth.service';
import { EmpresaOutput } from '../../../models/empresa/empresaOutput';
import { UsuarioTokenOutput } from '../../../models/usuario/usuarioTokenOutput';
import { UsuarioOutput } from '../../../models/usuario/usuarioOutput';
import { NgIf, NgFor } from '@angular/common';
import { UsuarioInput } from '../../../models/usuario/usuarioInput';

@Component({
  selector: 'app-alterar-dados-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgIf, NgFor],
  templateUrl: './alterar-dados-usuario.component.html',
  styleUrls: ['./alterar-dados-usuario.component.css'],
})
export class AlterarDadosUsuarioComponent implements OnInit {
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
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.usuarioId) {
      this.errorMessages.push('ID do usuário inválido');
      return;
    }

    this.usuarioService.buscarPorId(this.token, this.usuarioId).subscribe({
      next: (usuario: UsuarioOutput) => {
        this.initForm(usuario);
      },
      error: () => {
        this.errorMessages.push('Erro ao carregar dados do usuário.');
      },
    });
  }

  private initForm(usuario: UsuarioOutput) {
    this.empresaSelecionada = usuario.empresa || null;

    const formConfig: any = {
      nome: [usuario.nome || '', [Validators.required, Validators.maxLength(100)]],
      email: [usuario.email || '', [Validators.required, Validators.maxLength(320)]],
      telefone: [
        usuario.telefone || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(15)],
      ],
      ativo: [usuario.ativo, Validators.required],
      perfil: [usuario.perfil, Validators.required],
      empresa: [usuario.empresa?.id || '', Validators.required],
    };

    this.formUsuario = this.formBuilder.group(formConfig);
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

  buscarEmpresas(search: string = '', page: number = 0) {
    this.empresaService.listar(this.token, page, search).subscribe({
      next: (data) => {
        this.empresasFiltradas = page === 0 ? data.content : [...this.empresasFiltradas, ...data.content];
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  submitForm() {
    this.errorMessages = [];
    if (this.formUsuario.invalid) {
      this.errorMessages.push('Corrija os erros do formulário antes de salvar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload: UsuarioInput = { ...this.formUsuario.value };

    if (payload.nome) {
      payload.nome = payload.nome
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ');
    }

    if (payload.telefone) {
      const numeros = payload.telefone.replace(/\D/g, '');
      if (numeros.length === 11)
        payload.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
      else if (numeros.length === 10)
        payload.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
      else payload.telefone = numeros;
    }

    this.usuarioService.alterarDados(this.token, this.usuarioId, payload).subscribe({
      next: () => {
        this.successfullyUpdatedUsuario = 'Dados atualizados com sucesso!';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => this.router.navigate(['/usuario/listar']), 2000);
      },
      error: (erro) => {
        this.errorMessages.push(erro.error?.message || 'Ocorreu um erro inesperado.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }
}
