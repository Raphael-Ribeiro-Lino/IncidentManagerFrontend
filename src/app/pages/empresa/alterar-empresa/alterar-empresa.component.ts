import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EmpresaService } from '../../../services/empresa/empresa.service';
import { EmpresaInput } from '../../../models/empresa/empresaInput';
import { CnpjValidator } from '../../../shared/validators/cnpj.validator';
import { MaskDirective } from '../cadastrar-empresa/directives/mask.directive';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-alterar-empresa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MaskDirective,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './alterar-empresa.component.html',
  styleUrl: './alterar-empresa.component.css',
})
export class AlterarEmpresaComponent implements OnInit {
  formEmpresa: FormGroup;
  errorMessages: string[] = [];
  successMessage: string = '';
  token = localStorage.getItem('token') as string;
  isLoading: boolean = false;
  empresaId!: number;

  constructor(
    private formBuilder: FormBuilder,
    private empresaService: EmpresaService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    this.formEmpresa = this.formBuilder.group({
      id: [''],
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      cnpj: ['', [Validators.required, CnpjValidator.validate]],
      cep: ['', [Validators.required]],
      rua: ['', [Validators.required, Validators.maxLength(120)]],
      numero: ['', [Validators.required, Validators.maxLength(10)]],
      complemento: ['', [Validators.maxLength(50)]],
      bairro: ['', [Validators.required, Validators.maxLength(80)]],
      cidade: ['', [Validators.required, Validators.maxLength(80)]],
      estado: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
      ],
      ativo: [true, Validators.required],
    });
  }

  ngOnInit(): void {
    this.empresaId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.empresaId) {
      this.carregarEmpresa(this.empresaId);
    }

    this.formEmpresa.get('cep')?.valueChanges.subscribe((value) => {
      const cepLimpo = value?.replace(/\D/g, '') || '';
      if (cepLimpo.length === 0) this.resetarEndereco();
      else if (cepLimpo.length === 8) this.buscarCep(cepLimpo);
    });
  }

  carregarEmpresa(id: number) {
    this.isLoading = true;
    this.empresaService.buscarPorId(this.token, id).subscribe({
      next: (empresa: any) => {
        this.isLoading = false;
        this.formEmpresa.patchValue(empresa);

        if (empresa.rua) this.formEmpresa.get('rua')?.disable();
        if (empresa.bairro) this.formEmpresa.get('bairro')?.disable();
        if (empresa.cidade) this.formEmpresa.get('cidade')?.disable();
        if (empresa.estado) this.formEmpresa.get('estado')?.disable();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessages.push('Erro ao carregar dados da empresa.');
      },
    });
  }

  verificarDesativacao(event: MatCheckboxChange) {
    if (!event.checked) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          titulo: 'Inativar Empresa?',
          mensagem:
            'Tem certeza? Ao inativar esta empresa, todos os usuários e chamados vinculados a ela também serão inativados automaticamente.',
          icone: 'warning_amber',
          corBotao: 'warn',
          textoConfirmar: 'Sim, inativar',
          textoCancelar: 'Cancelar',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (!result) {
          this.formEmpresa.get('ativo')?.setValue(true);
        }
      });
    }
  }

  buscarCep(cepString: string) {
    this.isLoading = true;
    this.http.get(`https://viacep.com.br/ws/${cepString}/json/`).subscribe({
      next: (dados: any) => {
        this.isLoading = false;
        if (dados.erro) {
          this.formEmpresa.get('cep')?.setErrors({ cepNaoEncontrado: true });
          this.resetarEndereco();
          return;
        }
        this.formEmpresa.patchValue({
          rua: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf,
        });
        if (dados.logradouro) this.formEmpresa.get('rua')?.disable();
        if (dados.bairro) this.formEmpresa.get('bairro')?.disable();
        if (dados.localidade) this.formEmpresa.get('cidade')?.disable();
        if (dados.uf) this.formEmpresa.get('estado')?.disable();
      },
      error: () => {
        this.isLoading = false;
        this.resetarEndereco();
      },
    });
  }

  resetarEndereco() {
    this.formEmpresa.patchValue({
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
    });
    this.formEmpresa.get('rua')?.enable();
    this.formEmpresa.get('bairro')?.enable();
    this.formEmpresa.get('cidade')?.enable();
    this.formEmpresa.get('estado')?.enable();
  }

  cancelar() {
    this.router.navigate(['/empresa/listar']);
  }

  submitForm(): void {
    if (this.formEmpresa.invalid) return;

    this.errorMessages = [];
    this.successMessage = '';
    this.isLoading = true;

    const empresaInput = this.formEmpresa.getRawValue() as EmpresaInput;

    this.empresaService
      .alterar(this.token, this.empresaId, empresaInput)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Empresa atualizada com sucesso!';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.formEmpresa.disable();
          setTimeout(() => {
            this.router.navigate(['/empresa/listar']);
          }, 2000);
        },
        error: (erro) => {
          this.isLoading = false;
          if (erro.error && erro.error.message) {
            this.errorMessages.push(erro.error.message);
          } else {
            this.errorMessages.push('Ocorreu um erro ao atualizar.');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
  }
}
