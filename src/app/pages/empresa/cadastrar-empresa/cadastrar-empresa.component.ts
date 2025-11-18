import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  NavigationExtras,
  Router,
  RouterModule,
} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MaskDirective } from './directives/mask.directive';
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { EmpresaInput } from '../../../models/empresa/empresaInput';

@Component({
  selector: 'app-cadastrar-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MaskDirective],
  templateUrl: './cadastrar-empresa.component.html',
  styleUrl: './cadastrar-empresa.component.css',
})
export class CadastrarEmpresaComponent implements OnInit {
  formEmpresa: FormGroup;
  showErrorMessages: boolean = false;
  errorMessages: string[] = [];
  successfullyRegisteredEmpresa: string = '';
  token = localStorage.getItem('token') as string;

  constructor(
    private formBuilder: FormBuilder,
    private empresaService: EmpresaService,
    private router: Router,
    private http: HttpClient
  ) {
    this.formEmpresa = this.formBuilder.group({
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],

      cnpj: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/), // CNPJ formatado
        ],
      ],

      cep: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{5}-?\d{3}$/), // 00000-000
        ],
      ],

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

  buscarCep() {
    const cep = this.formEmpresa.get('cep')?.value;

    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      alert('CEP inválido!');
      return;
    }

    this.http.get(`https://viacep.com.br/ws/${cepLimpo}/json/`).subscribe({
      next: (dados: any) => {
        if (dados.erro) {
          alert('CEP não encontrado!');
          return;
        }

        this.formEmpresa.patchValue({
          rua: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf,
        });
        this.formEmpresa.get('rua')?.disable();
        this.formEmpresa.get('bairro')?.disable();
        this.formEmpresa.get('cidade')?.disable();
        this.formEmpresa.get('estado')?.disable();
      },
      error: () => {
        alert('Erro ao consultar CEP!');
      },
    });
  }

  cancelar() {
    this.router.navigate(['/empresa/listar']);
  }

  ngOnInit(): void {
    this.errorMessages = [];
  }

  submitForm(): void {
    this.errorMessages = [];
    let empresaInput = this.formEmpresa.getRawValue() as EmpresaInput;
    this.empresaService.cadastrar(this.token, empresaInput).subscribe({
      next: (data) => {
        this.successfullyRegisteredEmpresa = 'Empresa cadastrada com sucesso!';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          this.router.navigate(['/empresa/listar']);
        }, 2000);
      },
      error: (erro) => {
        if (erro.error && erro.error.message) {
          this.errorMessages.push(erro.error.message);
        } else {
          this.errorMessages.push(
            'Ocorreu um erro inesperado. Tente mais tarde, por favor!'
          );
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
          this.errorMessages = [];
        }, 5000);
      },
    });
  }
}
