import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

// Material Imports
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services & Models
import { AuthService } from '../../services/auth/auth.service';
import { LoginService } from '../../services/login/login.service';
import { NotificacaoService } from '../../services/notificacao/notificacao.service';
import { ChamadoService } from '../../services/chamado/chamado.service';
import { HeaderPerfilEnum } from '../../models/usuario/headerPerfilEnum';
import { NotificacaoOutput } from '../../models/notificacao/notificacaoOutput';
import { TipoNotificacaoEnum } from '../../models/notificacao/tipoNotificacaoEnum';
import { ChatChamadoComponent } from '../chat-chamado/chat-chamado.component';

// Import do Componente de Chat

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatDialogModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  nomeUsuario: string = '';
  iniciais: string = '';
  perfilUsuario!: HeaderPerfilEnum;
  public HeaderPerfilEnum = HeaderPerfilEnum;
  token = localStorage.getItem('token') as string;

  notificacoes: NotificacaoOutput[] = [];
  unreadCount: number = 0;
  private pollingSubscription!: Subscription;

  // Labels amigáveis (Removido Avaliação)
  tipoLabels: Record<string, string> = {
    NOVA_MENSAGEM: 'Nova Mensagem',
    MUDANCA_STATUS: 'Status Atualizado', // Cobre cancelamentos, mudanças gerais
    TRANSFERENCIA: 'Transferência Recebida',
    RESOLUCAO: 'Chamado Resolvido',
    REABERTURA: 'Chamado Reaberto',
  };

  constructor(
    private authService: AuthService,
    private loginService: LoginService,
    private notificacaoService: NotificacaoService,
    private chamadoService: ChamadoService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioLogado();
    if (usuario) {
      this.nomeUsuario = usuario.nome.split(' ')[0];
      this.perfilUsuario = usuario.perfil as HeaderPerfilEnum;
      const nomes = usuario.nome.split(' ');
      this.iniciais =
        nomes[0].charAt(0) +
        (nomes.length > 1 ? nomes[nomes.length - 1].charAt(0) : '');

      this.iniciarPollingNotificacoes();
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  iniciarPollingNotificacoes() {
    this.atualizarContador();
    this.pollingSubscription = interval(15000).subscribe(() => {
      this.atualizarContador();
    });
  }

  atualizarContador() {
    this.notificacaoService.contarNaoLidas(this.token).subscribe({
      next: (count) => (this.unreadCount = count),
      error: () => {},
    });
  }

  abrirMenuNotificacoes() {
    this.notificacaoService.listar(this.token, 0, 10).subscribe((page) => {
      this.notificacoes = page.content;
      this.atualizarContador();
    });
  }

  // --- LÓGICA DE NAVEGAÇÃO ---
  clicarNotificacao(n: NotificacaoOutput) {
    // 1. Marca como lida
    if (!n.lido) {
      this.notificacaoService.marcarComoLida(this.token, n.id).subscribe();
      n.lido = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }

    // 2. Redirecionamento baseado no Tipo
    switch (n.tipo) {
      // CHAT -> Abre Modal
      case TipoNotificacaoEnum.NOVA_MENSAGEM:
        this.abrirChatDireto(n.chamadoId);
        break;

      // TRANSFERENCIA -> Lista de Recebidos (Tab 1)
      case TipoNotificacaoEnum.TRANSFERENCIA:
        if (this.perfilUsuario === HeaderPerfilEnum.TECNICO_TI) {
          this.router.navigate(['/tecnico/atendimento/listar'], {
            queryParams: { tab: 1 },
          });
        }
        break;

      // MUDANÇA DE STATUS / CANCELAMENTO DE TRANSFERÊNCIA -> Lista Principal (Tab 0)
      // O cancelamento geralmente gera uma MUDANCA_STATUS
      case TipoNotificacaoEnum.MUDANCA_STATUS:
        if (this.perfilUsuario === HeaderPerfilEnum.TECNICO_TI) {
          // Volta para a lista de trabalho ("Meus Atendimentos")
          this.router.navigate(['/tecnico/atendimento/listar'], {
            queryParams: { tab: 0 },
          });
        } else {
          this.navegarParaDetalhes(n.chamadoId);
        }
        break;

      // RESOLUÇÃO -> Detalhes (para usuário avaliar ou técnico ver)
      case TipoNotificacaoEnum.RESOLUCAO:
        this.navegarParaDetalhes(n.chamadoId);
        break;

      // REABERTURA -> Lista Principal (Técnico precisa ver na fila)
      case TipoNotificacaoEnum.REABERTURA:
        if (this.perfilUsuario === HeaderPerfilEnum.TECNICO_TI) {
          this.router.navigate(['/tecnico/atendimento/listar'], {
            queryParams: { tab: 0 },
          });
        } else {
          this.navegarParaDetalhes(n.chamadoId);
        }
        break;

      default:
        this.navegarParaDetalhes(n.chamadoId);
        break;
    }
  }

  private navegarParaDetalhes(id: number) {
    if (this.perfilUsuario === HeaderPerfilEnum.TECNICO_TI) {
      this.router.navigate(['/tecnico/atendimento', id, 'detalhes']);
    } else {
      this.router.navigate(['/chamado', id, 'detalhes']);
    }
  }

  private abrirChatDireto(chamadoId: number) {
    this.chamadoService
      .buscarAtendimentoPorId(this.token, chamadoId)
      .subscribe({
        next: (chamado) => {
          this.dialog.open(ChatChamadoComponent, {
            width: '600px',
            height: '80vh',
            maxWidth: '95vw',
            maxHeight: '90vh',
            panelClass: 'chat-modal-panel',
            data: {
              chamadoId: chamado.id,
              protocolo: chamado.protocolo,
              status: chamado.status,
            },
          });
        },
        error: () => {
          this.navegarParaDetalhes(chamadoId);
        },
      });
  }

  marcarTodasComoLidas() {
    if (this.unreadCount === 0) return;
    this.notificacaoService.marcarTodasComoLidas(this.token).subscribe(() => {
      this.unreadCount = 0;
      this.notificacoes.forEach((n) => (n.lido = true));
    });
  }

  logout() {
    this.loginService.logout(this.token);
  }

  // Helpers Visuais
  getIcone(tipo: string): string {
    switch (tipo) {
      case TipoNotificacaoEnum.NOVA_MENSAGEM:
        return 'chat';
      case TipoNotificacaoEnum.MUDANCA_STATUS:
        return 'sync_alt';
      case TipoNotificacaoEnum.RESOLUCAO:
        return 'check_circle';
      case TipoNotificacaoEnum.TRANSFERENCIA:
        return 'move_to_inbox';
      case TipoNotificacaoEnum.REABERTURA:
        return 'replay';
      default:
        return 'notifications';
    }
  }

  getClassByTipo(tipo: string): string {
    switch (tipo) {
      case TipoNotificacaoEnum.NOVA_MENSAGEM:
        return 'bg-blue';
      case TipoNotificacaoEnum.RESOLUCAO:
        return 'bg-green';
      case TipoNotificacaoEnum.TRANSFERENCIA:
        return 'bg-purple';
      case TipoNotificacaoEnum.REABERTURA:
        return 'bg-red';
      default:
        return 'bg-gray'; // Mudança de status cai aqui
    }
  }
}
