import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Prioridades } from '../../../models/chamado/prioridadeEnum';
import { AnexoInput } from '../../../models/anexo/anexoInput';
import { Router } from '@angular/router';
import { ChamadoService } from '../../../services/chamado/chamado.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
    MatInputModule
  ],
  templateUrl: './cadastrar-chamado.component.html',
  styleUrl: './cadastrar-chamado.component.css',
})
export class CadastrarChamadoComponent implements OnInit {
  formChamado!: FormGroup;
  errorMessages: string[] = [];
  successfullyRegisteredChamado: string | null = null;
  isLoading = false;
  isDragging: boolean = false;

  private readonly allowedExtensions = ['PDF', 'DOCX', 'PNG', 'JPG', 'JPEG', 'ZIP'];
  private readonly maxFileSizeMB = 50;
  private readonly maxFileSizeInBytes = this.maxFileSizeMB * 1024 * 1024;

  prioridades = Object.values(Prioridades);

  anexosSelecionados: AnexoInput[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private chamadoService: ChamadoService
  ) {}

  ngOnInit(): void {
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
      anexos: this.fb.array([]),
    });
  }

  get f() {
    return this.formChamado.controls;
  }
  get formAnexos() {
    return this.formChamado.get('anexos') as FormArray;
  }

  getFileIcon(tipo: string): string {
    switch (tipo.toLowerCase()) {
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

  onFileSelected(event: any): void {
    this.errorMessages = this.errorMessages.filter(msg => !msg.startsWith('Erro de Anexo:'));

    const files: FileList = event.target.files;
    if (files.length === 0) {
      return;
    }

    const novosAnexos: AnexoInput[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileNameParts = file.name.split('.');
      const fileExtension = fileNameParts.pop()?.toUpperCase() || '';
      const tipoAnexo = this.getTipoAnexo(fileExtension);

      let isValid = true;

      if (file.size > this.maxFileSizeInBytes) {
          this.errorMessages.push(`Erro de Anexo: O arquivo "${file.name}" (Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB) excede o limite de ${this.maxFileSizeMB}MB.`);
          isValid = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (!this.allowedExtensions.includes(fileExtension)) {
          this.errorMessages.push(`Erro de Anexo: O arquivo "${file.name}" possui formato não permitido (.${fileExtension}). Formatos aceitos: ${this.allowedExtensions.join(', ')}.`);
          isValid = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const mockEvent = {
        target: {
          files: dataTransfer.files,
          value: null
        }
      };
      this.onFileSelected(mockEvent);
    }
  }

  removeAnexo(index: number): void {
    this.anexosSelecionados.splice(index, 1);
  }

  private getTipoAnexo(ext: string): any {
    return ext as string;
  }

  submitForm(): void {
    this.errorMessages = this.errorMessages.filter(msg => !msg.startsWith('Erro de Anexo:'));
    this.successfullyRegisteredChamado = null;

    if (this.formChamado.invalid) {
      this.formChamado.markAllAsTouched();
      this.errorMessages.push('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    if (this.errorMessages.some(msg => msg.startsWith('Erro de Anexo:'))) {
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
        this.errorMessages.push(erro.error?.message || 'Ocorreu um erro inesperado. Tente mais tarde.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/chamado/listar']);
  }
}
