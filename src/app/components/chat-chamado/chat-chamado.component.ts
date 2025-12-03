import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextFieldModule } from '@angular/cdk/text-field'; // <--- IMPORTANTE PARA O TEXTAREA
import { Subscription, interval } from 'rxjs';

import { ChatService } from '../../services/chat/chat.service';
import { AuthService } from '../../services/auth/auth.service';
import { HeaderPerfilEnum } from '../../models/usuario/headerPerfilEnum';
import { ChatMensagemOutput } from '../../models/chamado/chatMensagemOutput';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-chat-chamado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TextFieldModule, // <--- ADICIONE AQUI
  ],
  templateUrl: './chat-chamado.component.html',
  styleUrl: './chat-chamado.component.css',
})
export class ChatChamadoComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  mensagens: ChatMensagemOutput[] = [];
  textoMensagem: string = '';
  arquivosSelecionados: File[] = [];

  isLoading = false;
  isSending = false;
  isPrivate = false;

  chamadoId!: number;
  protocolo!: string;
  statusChamado!: string;
  token = localStorage.getItem('token')!;
  podeEnviarPrivado = false;

  private refreshSubscription!: Subscription;

  readonly EXTENSOES_PERMITIDAS = [
    'pdf',
    'doc',
    'docx',
    'png',
    'jpg',
    'jpeg',
    'zip',
  ];

  statusLabels: Record<string, string> = {
    ABERTO: 'Aberto',
    TRIAGEM: 'Triagem',
    EM_ATENDIMENTO: 'Em Atendimento',
    AGUARDANDO_CLIENTE: 'Aguardando Cliente',
    AGUARDANDO_PECA: 'Aguardando Peça',
    CONCLUIDO: 'Concluído',
    REABERTO: 'Reaberto',
    RESOLVIDO: 'Resolvido',
  };

  constructor(
    public dialogRef: MatDialogRef<ChatChamadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private chatService: ChatService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.chamadoId = data.chamadoId;
    this.protocolo = data.protocolo;
    this.statusChamado = data.status;
  }

  ngOnInit(): void {
    this.verificarPermissoes();
    this.carregarMensagens(false);
    this.iniciarPolling();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
  }

  isChatAtivo(): boolean {
    const statusPermitidos = [
      'EM_ATENDIMENTO',
      'AGUARDANDO_CLIENTE',
      'AGUARDANDO_PECA',
      'REABERTO',
    ];
    return statusPermitidos.includes(this.statusChamado);
  }

  verificarPermissoes(): void {
    const usuario = this.authService.getUsuarioLogado();
    if (
      usuario &&
      (usuario.perfil === HeaderPerfilEnum.TECNICO_TI ||
        usuario.perfil === HeaderPerfilEnum.ADMIN)
    ) {
      this.podeEnviarPrivado = true;
    }
  }

  iniciarPolling(): void {
    this.refreshSubscription = interval(5000).subscribe(() => {
      if (!this.isSending) this.carregarMensagens(true);
    });
  }

  carregarMensagens(silencioso: boolean): void {
    if (!silencioso) this.isLoading = true;

    this.chatService
      .listarMensagens(this.token, this.chamadoId, silencioso)
      .subscribe({
        next: (msgs) => {
          const houveNovas = msgs.length > this.mensagens.length;
          this.mensagens = msgs;
          if (!silencioso) this.isLoading = false;
          if (!silencioso || houveNovas) this.scrollToBottom();
        },
        error: (err) => {
          console.error(err);
          if (!silencioso) this.isLoading = false;
        },
      });
  }

  enviar(): void {
    const texto = this.textoMensagem.trim();
    if ((!texto && this.arquivosSelecionados.length === 0) || this.isSending)
      return;

    if (texto.length > 5000) {
      this.snackBar.open(
        'Mensagem muito longa. O limite é 5000 caracteres.',
        'OK',
        {
          duration: 4000,
          panelClass: ['snack-error'],
        }
      );
      return;
    }

    this.isSending = true;

    this.chatService
      .enviarMensagem(
        this.token,
        this.chamadoId,
        this.textoMensagem,
        this.isPrivate,
        this.arquivosSelecionados
      )
      .subscribe({
        next: (novaMsg) => {
          this.mensagens.push(novaMsg);
          this.limparFormulario();
          this.isSending = false;
          this.scrollToBottom();
        },
        error: (err) => {
          this.isSending = false;
          const msgErro = err.error?.message || 'Erro ao enviar mensagem.';
          this.snackBar.open(msgErro, 'Fechar', {
            duration: 4000,
            panelClass: ['snack-error'], // Classe global de erro (vermelha)
          });
        },
      });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop()?.toLowerCase() || '';

        if (this.EXTENSOES_PERMITIDAS.includes(ext)) {
          this.arquivosSelecionados.push(file);
        } else {
          // MENSAGEM DE ERRO BONITA
          this.snackBar.open(
            `O arquivo "${file.name}" não é permitido.`,
            'OK',
            {
              duration: 5000,
              panelClass: ['snack-error'],
            }
          );
        }
      }
    }
    this.fileInput.nativeElement.value = '';
  }

  removerArquivo(index: number): void {
    this.arquivosSelecionados.splice(index, 1);
  }

  limparFormulario(): void {
    this.textoMensagem = '';
    this.arquivosSelecionados = [];
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  fechar(): void {
    this.dialogRef.close();
  }
  baixarAnexo(url: string): void {
    window.open(url, '_blank');
  }

  trackByFn(index: number, item: ChatMensagemOutput): number {
    return item.id;
  }

  getIniciais(nome: string): string {
    if (!nome) return '';
    const partes = nome.trim().split(' ');

    if (partes.length === 1) {
      // Se só tem um nome (ex: "João"), pega as duas primeiras letras ("JO")
      return partes[0].substring(0, 2).toUpperCase();
    }

    // Se tem sobrenome, pega a primeira do primeiro e a primeira do último (ex: "João da Silva" -> "JS")
    const primeira = partes[0][0];
    const ultima = partes[partes.length - 1][0];
    return (primeira + ultima).toUpperCase();
  }
}
