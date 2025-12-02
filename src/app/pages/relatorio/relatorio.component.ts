import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  MAT_DATE_LOCALE,
  DateAdapter,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { RelatorioService } from '../../services/relatorio/relatorio.service';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { AuthService } from '../../services/auth/auth.service';
import { ChamadoOutput } from '../../models/chamado/chamadoOutput';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { HeaderPerfilEnum } from '../../models/usuario/headerPerfilEnum';
import { RelatorioFiltroInput } from '../../models/relatorio/relatorioFiltroInput';
import { TecnicoSelecaoOutput } from '../../models/usuario/tecnicoSelecaoOutput';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  Observable,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { DataMaskDirective } from './directive/data-mask.directive';
import { CustomDateAdapter } from '../../shared/adapters/custom-date-adapter';

registerLocaleData(localePt);

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'input',
  },
  display: {
    dateInput: 'input',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    PaginationComponent,
    DatePipe,
    DataMaskDirective,
  ],
  templateUrl: './relatorio.component.html',
  styleUrl: './relatorio.component.css',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class RelatorioComponent implements OnInit {
  formFiltro!: FormGroup;

  // Variável para bloquear datas futuras no HTML
  maxDate: Date = new Date();

  dataSource: ChamadoOutput[] = [];
  displayedColumns: string[] = [
    'protocolo',
    'titulo',
    'solicitante',
    'tecnico',
    'data',
    'status',
    'prioridade',
  ];

  page = 0;
  totalPages = 0;
  totalElementos = 0;

  isLoading = false;
  isExporting = false;
  hasSearched = false;

  statusLabels: Record<string, string> = {
    ABERTO: 'Aberto',
    TRIAGEM: 'Triagem',
    EM_ATENDIMENTO: 'Em Atendimento',
    AGUARDANDO_CLIENTE: 'Aguardando Cliente',
    AGUARDANDO_PECA: 'Aguardando Peça',
    RESOLVIDO: 'Resolvido',
    CONCLUIDO: 'Concluído',
    REABERTO: 'Reaberto',
  };
  statusKeys = Object.keys(this.statusLabels);

  prioridadeLabels: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };
  prioridadeKeys = Object.keys(this.prioridadeLabels);

  usuarioLogado: any;
  isTecnico = false;

  // Autocomplete Técnico
  tecnicoSearchControl = new FormControl('');
  tecnicosFiltrados$!: Observable<TecnicoSelecaoOutput[]>;
  isLoadingTecnicos = false;

  constructor(
    private fb: FormBuilder,
    private relatorioService: RelatorioService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dateAdapter: DateAdapter<any>
  ) {
    this.dateAdapter.setLocale('pt-BR');
  }

  ngOnInit(): void {
    this.usuarioLogado = this.authService.getUsuarioLogado();
    this.isTecnico = this.usuarioLogado?.perfil === HeaderPerfilEnum.TECNICO_TI;

    if (this.isTecnico) {
      this.displayedColumns = this.displayedColumns.filter(
        (col) => col !== 'tecnico'
      );
    }

    this.initForm();

    if (this.isTecnico) {
      this.buscarDados();
    } else {
      this.setupAutocompleteTecnico();
    }
  }

  initForm(): void {
    this.formFiltro = this.fb.group({
      dataInicio: [],
      dataFim: [],
      status: [''],
      prioridade: [''],
      tecnicoId: [this.isTecnico ? this.usuarioLogado.id : null],
    });
  }

  setupAutocompleteTecnico() {
    this.tecnicosFiltrados$ = this.tecnicoSearchControl.valueChanges.pipe(
      startWith(''),
      filter((value) => typeof value === 'string'),
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => (this.isLoadingTecnicos = true)),
      switchMap((value) => {
        const termo = value as string;
        return this.usuarioService
          .pesquisarTecnicos(localStorage.getItem('token')!, termo)
          .pipe(
            finalize(() => (this.isLoadingTecnicos = false)),
            map((page) => page.content || [])
          );
      })
    );
  }

  displayFn(tecnico: TecnicoSelecaoOutput): string {
    return tecnico && tecnico.nome ? tecnico.nome : '';
  }

  onTecnicoSelected(event: any): void {
    const tecnico: TecnicoSelecaoOutput = event.option.value;
    if (tecnico) {
      this.formFiltro.patchValue({ tecnicoId: tecnico.id });
    }
  }

  verificarLimpezaTecnico(): void {
    const valor = this.tecnicoSearchControl.value;
    if (!valor || typeof valor === 'string') {
      this.formFiltro.patchValue({ tecnicoId: null });
    }
  }

  buscarDados(): void {
    if (this.formFiltro.invalid) return;

    this.isLoading = true;
    this.hasSearched = true;

    const filtro = this.montarFiltro();

    this.relatorioService.buscarDados(filtro, this.page).subscribe({
      next: (res) => {
        this.dataSource = res.content;
        this.totalPages = res.page.totalPages;
        this.totalElementos = res.page.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.dataSource = [];
        this.snackBar.open('Erro ao buscar dados.', 'Fechar', {
          panelClass: 'snack-error',
        });
      },
    });
  }

  baixarArquivo(tipo: 'excel' | 'pdf'): void {
    if (this.totalElementos === 0) return;

    this.isExporting = true;
    const filtro = this.montarFiltro();

    const request =
      tipo === 'excel'
        ? this.relatorioService.exportarExcel(filtro)
        : this.relatorioService.exportarPdf(filtro);

    request.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_chamados_${
          new Date().toISOString().split('T')[0]
        }.${tipo === 'excel' ? 'xlsx' : 'pdf'}`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.isExporting = false;
        this.snackBar.open('Download concluído!', 'OK', {
          duration: 3000,
          panelClass: 'snack-success',
        });
      },
      error: () => {
        this.isExporting = false;
        this.snackBar.open('Erro ao gerar arquivo.', 'Fechar', {
          panelClass: 'snack-error',
        });
      },
    });
  }

  limparFiltros(): void {
    this.formFiltro.reset();
    this.tecnicoSearchControl.setValue('');
    this.dataSource = [];
    this.hasSearched = false;
    this.totalElementos = 0;
    this.initForm();
  }

  paginar(page: number): void {
    this.page = page;
    this.buscarDados();
  }

  private montarFiltro(): RelatorioFiltroInput {
    const values = this.formFiltro.value;

    // Corrige timezone para o backend
    const fmtDate = (d: Date) =>
      d
        ? new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0]
        : undefined;

    return {
      dataInicio: fmtDate(values.dataInicio),
      dataFim: fmtDate(values.dataFim),
      status: values.status || undefined,
      prioridade: values.prioridade || undefined,
      tecnicoId: this.isTecnico ? this.usuarioLogado.id : values.tecnicoId,
    };
  }
}
