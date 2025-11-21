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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CnpjValidator } from '../../../shared/validators/cnpj.validator';

@Component({
  selector: 'app-cadastrar-empresa',
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
  ],
  templateUrl: './cadastrar-empresa.component.html',
  styleUrl: './cadastrar-empresa.component.css',
})
export class CadastrarEmpresaComponent implements OnInit {
  formEmpresa: FormGroup;
  showErrorMessages: boolean = false;
  errorMessages: string[] = [];
  successfullyRegisteredEmpresa: string = '';
  token = localStorage.getItem('token') as string;
  isLoading: boolean = false;

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
          Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
          CnpjValidator.validate,
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

 buscarCep(cepString: string) {
    this.isLoading = true; // Mostra spinner enquanto busca CEP também (opcional)
    
    this.http.get(`https://viacep.com.br/ws/${cepString}/json/`).subscribe({
      next: (dados: any) => {
        this.isLoading = false;
        if (dados.erro) {
          // CEP não existe na base
          this.formEmpresa.get('cep')?.setErrors({ cepNaoEncontrado: true });
          this.resetarEndereco(); 
          return;
        }

        // Preenche e desabilita
        this.formEmpresa.patchValue({
          rua: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf,
        });

        // Só desabilita se o dado veio preenchido (as vezes viaCEP retorna bairro vazio)
        if(dados.logradouro) this.formEmpresa.get('rua')?.disable();
        if(dados.bairro) this.formEmpresa.get('bairro')?.disable();
        if(dados.localidade) this.formEmpresa.get('cidade')?.disable();
        if(dados.uf) this.formEmpresa.get('estado')?.disable();
      },
      error: () => {
        this.isLoading = false;
        this.resetarEndereco();
        alert('Erro ao consultar CEP, preencha manualmente.');
      },
    });
  }

  cancelar() {
    this.router.navigate(['/empresa/listar']);
  }

  ngOnInit(): void {
    this.errorMessages = [];
    this.formEmpresa.get('cep')?.valueChanges.subscribe((value) => {
      const cepLimpo = value?.replace(/\D/g, '') || '';

      if (cepLimpo.length === 0) {
        this.resetarEndereco();
      }
      else if (cepLimpo.length === 8) {
        this.buscarCep(cepLimpo);
      }
    });
  }

  resetarEndereco() {
    this.formEmpresa.patchValue({
      rua: '',
      bairro: '',
      cidade: '',
      estado: ''
    });
    this.formEmpresa.get('rua')?.enable();
    this.formEmpresa.get('bairro')?.enable();
    this.formEmpresa.get('cidade')?.enable();
    this.formEmpresa.get('estado')?.enable();
  }

  submitForm(): void {
    this.errorMessages = [];
    let empresaInput = this.formEmpresa.getRawValue() as EmpresaInput;
    this.empresaService.cadastrar(this.token, empresaInput).subscribe({
      next: (data) => {
        this.successfullyRegisteredEmpresa = 'Empresa cadastrada com sucesso!';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.formEmpresa.disable();
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
