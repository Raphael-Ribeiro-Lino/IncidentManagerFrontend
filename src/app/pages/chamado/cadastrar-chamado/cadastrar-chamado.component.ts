import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Prioridades } from '../../../models/chamado/prioridadeEnum';
import { AnexoInput } from '../../../models/anexo/anexoInput';
import { ChamadoService } from '../../../services/chamado/chamado.service';

@Component({
  selector: 'app-cadastrar-chamado',
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
  templateUrl: './cadastrar-chamado.component.html',
  styleUrl: './cadastrar-chamado.component.css',
})
export class CadastrarChamadoComponent implements OnInit, OnDestroy {
  formChamado!: FormGroup;
  errorMessages: string[] = [];
  successfullyRegisteredChamado: string | null = null;
  isLoading = false;
  isDragging: boolean = false;

  private formSubscription?: Subscription;

  private readonly allowedExtensions = ['PDF', 'DOCX', 'PNG', 'JPG', 'JPEG', 'ZIP'];
  private readonly maxFileSizeMB = 50;
  private readonly maxFileSizeInBytes = this.maxFileSizeMB * 1024 * 1024;
  private readonly maxTotalSizeMB = 500;
  private readonly maxTotalSizeInBytes = this.maxTotalSizeMB * 1024 * 1024;
  private readonly maxFileCount = 20;

  prioridades = Object.values(Prioridades);
  anexosSelecionados: AnexoInput[] = [];
  prioridadeLabels: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private chamadoService: ChamadoService
  ) {}

  ngOnInit(): void {
    this.formChamado = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      prioridade: ['', [Validators.required]],
      anexos: this.fb.array([]),
    });

    this.formSubscription = this.formChamado.valueChanges.subscribe(() => {
      if (this.errorMessages.length > 0) {
        this.errorMessages = this.errorMessages.filter((msg) =>
          msg.startsWith('Erro de Anexo:')
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  get f() { return this.formChamado.controls; }

  get maxTotalMB(): number {
    return this.maxTotalSizeMB;
  }

  get totalSizeUsed(): number {
    return this.anexosSelecionados.reduce((acc, anexo) => acc + anexo.tamanhoBytes, 0);
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

  getFileIcon(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc': case 'docx': return 'description';
      case 'png': case 'jpg': case 'jpeg': return 'image';
      case 'zip': return 'folder_zip';
      default: return 'attach_file';
    }
  }

  onFileSelected(event: any): void {
    this.errorMessages = this.errorMessages.filter((msg) => !msg.startsWith('Erro de Anexo:'));

    const files: FileList = event.target.files;
    if (files.length === 0) return;

    if (this.anexosSelecionados.length + files.length > this.maxFileCount) {
      this.addErrorMessage(
        `Erro de Anexo: Limite excedido. O máximo permitido são ${this.maxFileCount} arquivos por chamado.`,
        7000
      );
      event.target.value = null;
      return;
    }

    const novosAnexos: AnexoInput[] = [];
    let tamanhoAtualAcumulado = this.totalSizeUsed;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileNameParts = file.name.split('.');
      const fileExtension = fileNameParts.pop()?.toUpperCase() || '';
      const tipoAnexo = this.getTipoAnexo(fileExtension);

      let isValid = true;

      if (file.size > this.maxFileSizeInBytes) {
        this.addErrorMessage(
          `Erro de Anexo: O arquivo "${file.name}" excede o limite individual de ${this.maxFileSizeMB}MB.`,
          7000
        );
        isValid = false;
      }

      if (!this.allowedExtensions.includes(fileExtension)) {
        this.addErrorMessage(
          `Erro de Anexo: O arquivo "${file.name}" possui formato inválido.`,
          7000
        );
        isValid = false;
      }

      if (isValid && (tamanhoAtualAcumulado + file.size > this.maxTotalSizeInBytes)) {
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
        tamanhoAtualAcumulado += file.size;
      }
    }

    this.anexosSelecionados = [...this.anexosSelecionados, ...novosAnexos];
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

  removeAnexo(index: number): void {
    this.anexosSelecionados.splice(index, 1);
  }

  private getTipoAnexo(ext: string): any {
    return ext as string;
  }

  submitForm(): void {
    this.errorMessages = [];
    this.successfullyRegisteredChamado = null;

    if (this.formChamado.invalid) {
      this.formChamado.markAllAsTouched();
      this.addErrorMessage('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    if (this.errorMessages.some((msg) => msg.startsWith('Erro de Anexo:'))) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.isLoading = true;

    const chamadoPayload = {
      ...this.formChamado.value,
      anexos: this.anexosSelecionados,
    };

    const token = localStorage.getItem('token') as string;

    this.chamadoService.cadastrar(token, chamadoPayload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successfullyRegisteredChamado = `Chamado ${res.protocolo} criado com sucesso!`;
        this.formChamado.disable();
        this.anexosSelecionados = [];
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => this.router.navigate(['/chamado/listar']), 2000);
      },
      error: (erro) => {
        this.isLoading = false;
        const msg = erro.error?.message || 'Ocorreu um erro inesperado. Tente mais tarde.';
        this.addErrorMessage(msg, 10000);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/chamado/listar']);
  }
}
