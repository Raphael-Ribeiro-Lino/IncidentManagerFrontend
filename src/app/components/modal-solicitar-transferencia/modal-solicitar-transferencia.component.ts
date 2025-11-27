import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, tap } from 'rxjs';
import { TecnicoSelecaoOutput } from '../../models/usuario/tecnicoSelecaoOutput';
import { UsuarioService } from '../../services/usuario/usuario.service';

@Component({
  selector: 'app-modal-solicitar-transferencia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  templateUrl: './modal-solicitar-transferencia.component.html',
  styleUrl: './modal-solicitar-transferencia.component.css',
})
export class ModalSolicitarTransferenciaComponent implements OnInit {
  form: FormGroup;
  
  // Observable que vai alimentar o autocomplete dinamicamente
  tecnicosFiltrados!: Observable<TecnicoSelecaoOutput[]>;
  
  // Controle de busca
  searchControl = new FormControl<string | TecnicoSelecaoOutput>('', Validators.required);
  
  // Controle de loading visual para o input
  isLoadingSearch = false;

  token = localStorage.getItem('token')!;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    public dialogRef: MatDialogRef<ModalSolicitarTransferenciaComponent>
  ) {
    this.form = this.fb.group({
      tecnicoDestinoId: [null, Validators.required],
      motivo: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    this.configurarAutocompleteServerSide();
  }

  configurarAutocompleteServerSide(): void {
    this.tecnicosFiltrados = this.searchControl.valueChanges.pipe(
      // 1. Filtra apenas se for string (usuário digitando). Se for objeto, é seleção.
      filter(value => typeof value === 'string'),
      // 2. Espera 400ms após o usuário parar de digitar para não bombardear a API
      debounceTime(400),
      // 3. Ignora se o texto for igual ao anterior
      distinctUntilChanged(),
      // 4. Efeito colateral: Ativa o loading
      tap(() => this.isLoadingSearch = true),
      // 5. Troca a busca anterior pela nova (cancela requests pendentes)
      switchMap(value => {
        const termoBusca = value as string;
        // Chama o service passando o termo de busca
        return this.usuarioService.listarTecnicosParaTransferencia(this.token, termoBusca)
          .pipe(
            // Desativa loading quando termina
            finalize(() => this.isLoadingSearch = false),
            // Extrai o conteúdo da página (ajuste 'page.content' conforme seu retorno real)
            map(page => page.content || [])
          );
      })
    );

    // Listener para atualizar o ID no formulário principal quando selecionar
    this.searchControl.valueChanges.subscribe(value => {
      if (typeof value === 'object' && value !== null) {
        // Selecionou um técnico válido
        this.form.patchValue({ tecnicoDestinoId: value.id });
      } else {
        // Está digitando ou limpou -> Remove o ID para invalidar o form
        this.form.patchValue({ tecnicoDestinoId: null });
      }
    });
  }

  displayFn(tecnico: TecnicoSelecaoOutput): string {
    return tecnico && tecnico.nome ? tecnico.nome : '';
  }

  // Validação ao sair do campo (Blur)
  verificarSelecao(): void {
    const valorAtual = this.searchControl.value;
    // Se o valor ainda é string (não selecionou objeto), limpa o campo ou marca erro
    if (typeof valorAtual === 'string') {
        // Se quiser ser rigoroso: Limpa o campo se não selecionou
        if (!this.form.get('tecnicoDestinoId')?.value) {
            this.searchControl.setErrors({ required: true });
            // Opcional: Limpar o texto visualmente se for inválido
            // this.searchControl.setValue(''); 
        }
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  confirmar(): void {
    if (this.form.valid && this.form.get('tecnicoDestinoId')?.value) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
      this.searchControl.markAsTouched();
      
      if (!this.form.get('tecnicoDestinoId')?.value) {
         this.searchControl.setErrors({ required: true });
      }
    }
  }
  
  // Necessário importar o map dentro do switchMap
  private map(arg0: (page: any) => any): import("rxjs").OperatorFunction<Object, any> {
      throw new Error('Function not implemented.');
  }
}