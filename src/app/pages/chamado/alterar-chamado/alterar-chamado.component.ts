import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core'; // Adicionado OnDestroy
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs'; // Adicionado

// Ajuste os caminhos conforme seu projeto
import { ChamadoService } from '../../../services/chamado/chamado.service';
import { Prioridades } from '../../../models/chamado/prioridadeEnum';
import { AnexoInput } from '../../../models/anexo/anexoInput';
import { ChamadoOutput } from '../../../models/chamado/chamadoOutput';
import { DialogData } from '../../../models/dialogData/dialogData';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-alterar-chamado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TitleCasePipe,
    DecimalPipe,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './alterar-chamado.component.html',
  styleUrl: './alterar-chamado.component.css',
})
export class AlterarChamadoComponent implements OnInit, OnDestroy {
  formChamado!: FormGroup;
  chamadoId!: number;
  chamadoAtual!: ChamadoOutput;

  errorMessages: string[] = [];
  successfullyUpdatedMessage: string | null = null;
  isLoading = false;
  isDragging: boolean = false;
  isStatusInvalid: boolean = false;

  // Subscription para monitorar mudanças no form (Igual ao Cadastro)
  private formSubscription?: Subscription;

  private readonly allowedExtensions = [
    'PDF',
    'DOCX',
    'PNG',
    'JPG',
    'JPEG',
    'ZIP',
  ];
  private readonly maxFileSizeMB = 50;
  private readonly maxFileSizeInBytes = this.maxFileSizeMB * 1024 * 1024;
  private readonly maxTotalSizeMB = 500;
  private readonly maxTotalSizeInBytes = this.maxTotalSizeMB * 1024 * 1024;
  private readonly maxFileCount = 20;

  prioridades = Object.values(Prioridades);
  prioridadeLabels: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };

  novosAnexosSelecionados: AnexoInput[] = [];
  anexosExistentes: any[] = []; // Mantive any ou sua interface de Output

  token = localStorage.getItem('token') as string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private chamadoService: ChamadoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Lógica igual ao Cadastro: Limpa erros (exceto de anexo) ao digitar
    this.formSubscription = this.formChamado.valueChanges.subscribe(() => {
      if (this.errorMessages.length > 0) {
        this.errorMessages = this.errorMessages.filter((msg) =>
          msg.startsWith('Erro de Anexo:')
        );
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.chamadoId = Number(idParam);
      this.carregarDadosChamado();
    } else {
      this.router.navigate(['/chamado/listar']);
    }
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  private initForm(): void {
    // Mesmas validações do Cadastro
    this.formChamado = this.fb.group({
      titulo: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      descricao: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(2000),
        ],
      ],
      prioridade: ['', [Validators.required]],
    });
  }

  get f() {
    return this.formChamado.controls;
  }

  get maxTotalMB(): number {
    return this.maxTotalSizeMB;
  }

  get totalSizeUsed(): number {
    const sizeExisting = this.anexosExistentes.reduce(
      (acc, anexo) => acc + (anexo.tamanhoBytes || 0),
      0
    );
    const sizeNew = this.novosAnexosSelecionados.reduce(
      (acc, anexo) => acc + anexo.tamanhoBytes,
      0
    );
    return sizeExisting + sizeNew;
  }

  get percentageUsed(): number {
    return Math.min(100, (this.totalSizeUsed / this.maxTotalSizeInBytes) * 100);
  }

  getProgressColorClass(): string {
    const pct = this.percentageUsed;
    if (pct < 50) return 'progress-success';
    if (pct < 80) return 'progress-warning';
    return 'progress-danger';
  }

  // --- MÉTODOS DE ERRO IDÊNTICOS AO CADASTRO ---

  addErrorMessage(msg: string, timeInMillis: number = 0) {
    this.errorMessages.push(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (timeInMillis > 0) {
      setTimeout(() => {
        this.removeErrorMsg(msg);
      }, timeInMillis);
    }
  }

  removeErrorMsg(msg: string) {
    this.errorMessages = this.errorMessages.filter((m) => m !== msg);
  }

  removeErrorIndex(index: number) {
    this.errorMessages.splice(index, 1);
  }

  // ------------------------------------------------

  carregarDadosChamado(): void {
    this.isLoading = true;
    this.isStatusInvalid = false;

    this.chamadoService.buscarPorId(this.token, this.chamadoId).subscribe({
      next: (chamado) => {
        this.chamadoAtual = chamado;
        const statusPermitidos = ['ABERTO', 'TRIAGEM', 'REABERTO'];

        if (!statusPermitidos.includes(chamado.status)) {
          this.isStatusInvalid = true;
          this.isLoading = false;
          return;
        }

        this.formChamado.patchValue({
          titulo: chamado.titulo,
          descricao: chamado.descricao,
          prioridade: chamado.prioridade,
        });

        this.anexosExistentes = chamado.anexos ? [...chamado.anexos] : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.addErrorMessage('Erro ao carregar os dados do chamado.', 0);
        this.isLoading = false;
      },
    });
  }

  getFileIcon(tipo: string): string {
    switch (tipo?.toLowerCase()) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'image';
      case 'zip':
        return 'folder_zip';
      default:
        return 'attach_file';
    }
  }

  private getTipoAnexo(ext: string): any {
    return ext as string; // Ou use seu Enum se necessário
  }

  // --- Lógica de Upload (Ajustada para considerar Existentes + Novos) ---

  onFileSelected(event: any): void {
    // Filtra erros de anexo anteriores
    this.errorMessages = this.errorMessages.filter(
      (msg) => !msg.startsWith('Erro de Anexo:')
    );

    const files: FileList = event.target.files;
    if (files.length === 0) return;

    // Validação de Quantidade Total
    const totalCount =
      this.anexosExistentes.length +
      this.novosAnexosSelecionados.length +
      files.length;

    if (totalCount > this.maxFileCount) {
      this.addErrorMessage(
        `Erro de Anexo: Limite excedido. O máximo permitido são ${this.maxFileCount} arquivos por chamado.`,
        7000
      );
      event.target.value = null;
      return;
    }

    const novosAnexos: AnexoInput[] = [];
    let tamanhoSimulado = this.totalSizeUsed;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileNameParts = file.name.split('.');
      const fileExtension = fileNameParts.pop()?.toUpperCase() || '';
      const tipoAnexo = this.getTipoAnexo(fileExtension);

      let isValid = true;

      // Validação Tamanho Individual
      if (file.size > this.maxFileSizeInBytes) {
        this.addErrorMessage(
          `Erro de Anexo: O arquivo "${file.name}" excede o limite individual de ${this.maxFileSizeMB}MB.`,
          7000
        );
        isValid = false;
      }

      // Validação Extensão
      if (!this.allowedExtensions.includes(fileExtension)) {
        this.addErrorMessage(
          `Erro de Anexo: O arquivo "${file.name}" possui formato inválido.`,
          7000
        );
        isValid = false;
      }

      // Validação Tamanho Total
      if (isValid && tamanhoSimulado + file.size > this.maxTotalSizeInBytes) {
        this.addErrorMessage(
          `Erro de Anexo: O arquivo "${file.name}" não cabe no limite total de ${this.maxTotalSizeMB}MB.`,
          7000
        );
        isValid = false;
      }

      if (isValid) {
        novosAnexos.push({
          nomeArquivo: file.name,
          tamanhoBytes: file.size,
          tipo: tipoAnexo,
          arquivo: file,
        });
        tamanhoSimulado += file.size;
      }
    }

    this.novosAnexosSelecionados = [
      ...this.novosAnexosSelecionados,
      ...novosAnexos,
    ];
    event.target.value = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const dataTransfer = event.dataTransfer;
    if (dataTransfer && dataTransfer.files.length) {
      this.onFileSelected({
        target: { files: dataTransfer.files, value: null },
      });
    }
  }

  removeNovoAnexo(index: number): void {
    this.novosAnexosSelecionados.splice(index, 1);
  }

  removerAnexoExistente(index: number): void {
    const anexo = this.anexosExistentes[index];
    const dialogData: DialogData = {
      titulo: 'Remover Anexo',
      mensagem: `Deseja remover o arquivo "${anexo.nomeArquivo}"? A exclusão será salva ao clicar em "Salvar Alterações".`,
      icone: 'delete_forever',
      corBotao: 'warn',
      textoConfirmar: 'Remover',
      textoCancelar: 'Manter',
      mostrarCancelar: true,
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.anexosExistentes.splice(index, 1);
      }
    });
  }

  submitForm(): void {
    // 1. Limpa erros antigos (que não sejam de anexo, pois a lógica abaixo pode gerar novos)
    this.errorMessages = this.errorMessages.filter((msg) =>
      msg.startsWith('Erro de Anexo:')
    );
    this.successfullyUpdatedMessage = null;

    // 2. Validação Campos Obrigatórios
    if (this.formChamado.invalid) {
      this.formChamado.markAllAsTouched();
      this.addErrorMessage(
        'Por favor, preencha todos os campos obrigatórios corretamente.'
      );
      return;
    }

    // 3. Impede envio se houver erros de anexo pendentes
    if (this.errorMessages.some((msg) => msg.startsWith('Erro de Anexo:'))) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.isLoading = true;

    // Preparar lista de existentes (enviando ID para o backend reconhecer)
    const anexosExistentesParaEnvio: AnexoInput[] = this.anexosExistentes.map(
      (anexo) => {
        return {
          id: anexo.id, // IMPORTANTE: O ID deve ir aqui
          nomeArquivo: anexo.nomeArquivo,
          tamanhoBytes: anexo.tamanhoBytes,
          tipo: anexo.tipo,
          arquivo: null as any,
        };
      }
    );

    // Unir com os novos uploads
    const listaFinalAnexos: AnexoInput[] = [
      ...anexosExistentesParaEnvio,
      ...this.novosAnexosSelecionados,
    ];

    const chamadoInput = {
      titulo: this.formChamado.get('titulo')?.value,
      descricao: this.formChamado.get('descricao')?.value,
      prioridade: this.formChamado.get('prioridade')?.value,
      anexos: listaFinalAnexos,
    };

    this.chamadoService
      .alterar(this.token, this.chamadoId, chamadoInput)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successfullyUpdatedMessage = `Chamado atualizado com sucesso!`;
          this.formChamado.disable();
          this.novosAnexosSelecionados = [];
          window.scrollTo({ top: 0, behavior: 'smooth' });

          setTimeout(
            () =>
              this.router.navigate(['/chamado', this.chamadoId, 'detalhes']),
            1500
          );
        },
        error: (erro) => {
          this.isLoading = false;
          const msgBackend =
            erro.error?.message ||
            erro.error?.error ||
            'Ocorreu um erro ao atualizar.';
          this.addErrorMessage(msgBackend, 10000); // Timeout maior para erro de backend
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/chamado/listar']);
  }
}
