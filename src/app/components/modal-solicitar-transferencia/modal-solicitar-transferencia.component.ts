import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  Observable,
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
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
    MatAutocompleteModule,
  ],
  templateUrl: './modal-solicitar-transferencia.component.html',
  styleUrl: './modal-solicitar-transferencia.component.css',
})
export class ModalSolicitarTransferenciaComponent implements OnInit {
  form: FormGroup;

  // Observable que vai alimentar o autocomplete dinamicamente
  tecnicosFiltrados!: Observable<TecnicoSelecaoOutput[]>;

  // Controle de busca
  searchControl = new FormControl<string | TecnicoSelecaoOutput>(
    '',
    Validators.required
  );

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
      motivo: ['', [Validators.required, Validators.maxLength(2000)]],
    });
  }

  ngOnInit(): void {
    this.configurarAutocompleteServerSide();
  }

  configurarAutocompleteServerSide(): void {
    this.tecnicosFiltrados = this.searchControl.valueChanges.pipe(
      // 1. Inicia a busca imediatamente ao abrir o modal
      startWith(''),
      
      // 2. Filtra para processar apenas texto (ignora seleção de objeto)
      filter(value => typeof value === 'string'),
      
      // 3. Debounce para digitação
      debounceTime(400),
      
      // 4. Evita chamadas repetidas
      distinctUntilChanged(),
      
      // 5. Lógica do Loading Local (Spinner do Input)
      tap((valor) => {
        // Truque: converte string vazia '' para false, e texto para true.
        // Assim, na carga inicial (''), o loading local fica false (invisível).
        // Quando digitar, fica true (visível).
        this.isLoadingSearch = !!valor; 
      }),
      
      // 6. Busca no Backend
      switchMap(value => {
        const termoBusca = value as string;
        
        return this.usuarioService.listarTecnicosParaTransferencia(this.token, termoBusca)
          .pipe(
            delay(300),
            // Garante que o loading desligue ao terminar, independente de como começou
            finalize(() => this.isLoadingSearch = false),
            
            // Tratamento de erro silencioso para não quebrar o observable
            catchError(() => {
               return of({ content: [] } as any); // Retorna lista vazia em caso de erro
            }),
            
            map(page => page.content || [])
          );
      })
    );

    // Listener para atualizar o ID no formulário principal quando selecionar
    this.searchControl.valueChanges.subscribe((value) => {
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
}
