import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { ChamadoService } from '../../../services/chamado/chamado.service';
import { Prioridades } from '../../../models/chamado/prioridadeEnum';
import { AnexoInput } from '../../../models/anexo/anexoInput';
import { ChamadoOutput } from '../../../models/chamado/chamadoOutput';
import { TipoAnexoEnum } from '../../../models/anexo/tipoAnexoEnum';

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
export class AlterarChamadoComponent implements OnInit {
  formChamado!: FormGroup;
  chamadoId!: number;
  chamadoAtual!: ChamadoOutput;

  errorMessages: string[] = [];
  successfullyUpdatedMessage: string | null = null;
  isLoading = false;
  isDragging: boolean = false;

  // Controle visual de bloqueio
  isStatusInvalid: boolean = false;

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

  prioridades = Object.values(Prioridades);

  novosAnexosSelecionados: AnexoInput[] = [];
  // Mantemos os dados originais para poder enviar de volta (ID é crucial)
  anexosExistentes: any[] = [];

  token = localStorage.getItem('token') as string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private chamadoService: ChamadoService
  ) {}

  ngOnInit(): void {
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.chamadoId = Number(idParam);
      this.carregarDadosChamado();
    } else {
      this.router.navigate(['/chamado/listar']);
    }
  }

  private initForm(): void {
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

  carregarDadosChamado(): void {
    this.isLoading = true;
    this.isStatusInvalid = false;

    this.chamadoService.buscarPorId(this.token, this.chamadoId).subscribe({
      next: (chamado) => {
        this.chamadoAtual = chamado;

        // Validação Visual de Status
        const statusPermitidos = ['ABERTO', 'TRIAGEM', 'REABERTO'];
        if (!statusPermitidos.includes(chamado.status)) {
          this.isStatusInvalid = true; // Ativa o card de bloqueio e esconde o form
          this.isLoading = false;
          return;
        }

        this.formChamado.patchValue({
          titulo: chamado.titulo,
          descricao: chamado.descricao,
          prioridade: chamado.prioridade,
        });

        // Clona o array para permitir manipulação local (exclusão)
        this.anexosExistentes = chamado.anexos ? [...chamado.anexos] : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessages.push('Erro ao carregar os dados do chamado.');
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

  // --- Manipulação de Arquivos ---

  onFileSelected(event: any): void {
    this.errorMessages = this.errorMessages.filter(
      (msg) => !msg.startsWith('Erro de Anexo:')
    );
    const files: FileList = event.target.files;
    if (files.length === 0) return;

    const novosAnexos: AnexoInput[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileNameParts = file.name.split('.');
      const fileExtension = fileNameParts.pop()?.toUpperCase() || '';

      // Cast seguro se você tiver certeza que a extensão bate com o Enum,
      // senão use um default ou valide antes.
      const tipoAnexo = fileExtension as TipoAnexoEnum;

      let isValid = true;

      if (file.size > this.maxFileSizeInBytes) {
        this.errorMessages.push(
          `Erro de Anexo: O arquivo "${file.name}" excede o limite.`
        );
        isValid = false;
      }
      if (!this.allowedExtensions.includes(fileExtension)) {
        this.errorMessages.push(
          `Erro de Anexo: Formato inválido para "${file.name}".`
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
      const mockEvent = { target: { files: dataTransfer.files, value: null } };
      this.onFileSelected(mockEvent);
    }
  }

  removeNovoAnexo(index: number): void {
    this.novosAnexosSelecionados.splice(index, 1);
  }

  // Remove da lista visual. Ao salvar, este anexo não será enviado,
  // indicando ao backend que ele deve ser removido (dependendo da lógica do backend).
  removerAnexoExistente(index: number): void {
    if (confirm('Tem certeza que deseja remover este anexo?')) {
      this.anexosExistentes.splice(index, 1);
    }
  }

  // --- Submissão ---

  submitForm(): void {
    this.errorMessages = this.errorMessages.filter(
      (msg) => !msg.startsWith('Erro de Anexo:')
    );
    this.successfullyUpdatedMessage = null;

    if (this.formChamado.invalid) {
      this.formChamado.markAllAsTouched();
      this.errorMessages.push(
        'Por favor, preencha todos os campos obrigatórios corretamente.'
      );
      return;
    }

    this.isLoading = true;

    // 1. Preparar Anexos Existentes
    // Criamos um "Dummy File" para passar pela validação do serviço que lê .name
    const anexosExistentesMapeados = this.anexosExistentes.map((anexo) => {
      const dummyFile = new File([''], anexo.nomeArquivo, {
        type: 'application/octet-stream',
      });

      return {
        id: anexo.id, // Importante manter o ID para o backend saber quem é
        nomeArquivo: anexo.nomeArquivo,
        tamanhoBytes: anexo.tamanhoBytes || 0,
        tipo: anexo.tipo,
        arquivo: dummyFile,
      };
    });

    // 2. Combinar Listas
    const listaFinalAnexos = [
      ...anexosExistentesMapeados,
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
          this.successfullyUpdatedMessage = `Chamado ${res.protocolo} atualizado com sucesso!`;
          this.formChamado.disable();
          this.novosAnexosSelecionados = [];
          window.scrollTo({ top: 0, behavior: 'smooth' });

          setTimeout(
            () =>
              this.router.navigate(['/chamado', this.chamadoId, 'detalhes']),
            2000
          );
        },
        error: (erro) => {
          this.isLoading = false;
          const msgBackend =
            erro.error?.message ||
            erro.error?.error ||
            'Ocorreu um erro ao atualizar.';
          this.errorMessages.push(msgBackend);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
  }

  cancelar(): void {
    if (this.isStatusInvalid) {
      this.router.navigate(['/chamado/listar']);
    } else {
      this.router.navigate(['/chamado/listar']);
    }
  }
}
