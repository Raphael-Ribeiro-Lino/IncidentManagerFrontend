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
import { MatTooltipModule } from '@angular/material/tooltip';

// Services & Models
import { AuthService } from '../../services/auth/auth.service';
import { LoginService } from '../../services/login/login.service';
import { NotificacaoService } from '../../services/notificacao/notificacao.service';
import { HeaderPerfilEnum } from '../../models/usuario/headerPerfilEnum';
import { NotificacaoOutput } from '../../models/notificacao/notificacaoOutput';
import { TipoNotificacaoEnum } from '../../models/notificacao/tipoNotificacaoEnum';

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
    MatTooltipModule,
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

  // Labels para tradução dos status na mensagem
  statusLabels: Record<string, string> = {
    ABERTO: 'ABERTO',
    TRIAGEM: 'TRIAGEM',
    EM_ATENDIMENTO: 'EM ATENDIMENTO',
    AGUARDANDO_CLIENTE: 'AGUARDANDO CLIENTE',
    AGUARDANDO_PECA: 'AGUARDANDO PEÇA',
    RESOLVIDO: 'RESOLVIDO',
    CONCLUIDO: 'CONCLUÍDO',
    REABERTO: 'REABERTO',
  };

  constructor(
    private authService: AuthService,
    private loginService: LoginService,
    private notificacaoService: NotificacaoService,
    private router: Router
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
    this.pollingSubscription = interval(10000).subscribe(() => {
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

  // --- FORMATAÇÃO VISUAL ---

  // Substitui códigos (EM_ATENDIMENTO) por texto bonito (Em Atendimento)
  formatarMensagem(mensagem: string): string {
    if (!mensagem) return '';
    let msgFormatada = mensagem;

    Object.keys(this.statusLabels).forEach((key) => {
      // Regex para substituir apenas a palavra exata ou se estiver contida de forma clara
      if (msgFormatada.includes(key)) {
        msgFormatada = msgFormatada.replace(key, this.statusLabels[key]);
      }
    });
    return msgFormatada;
  }

  getTituloInteligente(n: NotificacaoOutput): string {
    const msg = n.mensagem.toLowerCase();
    switch (n.tipo) {
      case TipoNotificacaoEnum.NOVA_MENSAGEM:
        return 'Nova Mensagem';
      case TipoNotificacaoEnum.RESOLUCAO:
        return 'Chamado Resolvido';
      case TipoNotificacaoEnum.REABERTURA:
        return 'Chamado Reaberto';
      case TipoNotificacaoEnum.MUDANCA_STATUS:
        return 'Status Atualizado';
      case TipoNotificacaoEnum.TRANSFERENCIA:
        if (msg.includes('cancelou')) return 'Transferência Cancelada';
        if (msg.includes('aceitou')) return 'Transferência Aceita';
        if (msg.includes('recusou')) return 'Transferência Recusada';
        if (msg.includes('deseja transferir'))
          return 'Solicitação de Transferência';
        if (msg.includes('definido como responsável'))
          return 'Chamado Atribuído';
        return 'Transferência';
      default:
        return 'Notificação';
    }
  }

  getIcone(n: NotificacaoOutput): string {
    const titulo = this.getTituloInteligente(n);
    if (titulo === 'Nova Mensagem') return 'chat';
    if (titulo === 'Chamado Resolvido') return 'check_circle';
    if (titulo === 'Chamado Reaberto') return 'replay';
    if (titulo === 'Transferência Aceita') return 'handshake';
    if (titulo === 'Transferência Recusada') return 'cancel';
    if (titulo === 'Transferência Cancelada') return 'block';
    if (titulo === 'Solicitação de Transferência') return 'move_to_inbox';
    if (titulo === 'Chamado Atribuído') return 'assignment_ind';
    return 'notifications';
  }

  getClassByTipo(n: NotificacaoOutput): string {
    const titulo = this.getTituloInteligente(n);
    if (titulo === 'Nova Mensagem') return 'bg-blue';
    if (titulo === 'Chamado Resolvido' || titulo === 'Transferência Aceita')
      return 'bg-green';
    if (titulo === 'Chamado Reaberto' || titulo === 'Transferência Recusada')
      return 'bg-red';
    if (
      titulo === 'Solicitação de Transferência' ||
      titulo === 'Chamado Atribuído'
    )
      return 'bg-purple';
    return 'bg-gray';
  }

  // --- NAVEGAÇÃO CENTRALIZADA ---

  clicarNotificacao(n: NotificacaoOutput) {
    // 1. Marca como lida
    if (!n.lido) {
      this.notificacaoService.marcarComoLida(this.token, n.id).subscribe();
      n.lido = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }

    const titulo = this.getTituloInteligente(n);
    const isTecnico = this.perfilUsuario === HeaderPerfilEnum.TECNICO_TI;

    // 2. Roteamento
    if (titulo === 'Nova Mensagem') {
      // Vai para a tela de detalhes (que abrirá o modal)
      // Isso corrige o erro 404 pois usa a rota correta para cada perfil
      this.navegarParaDetalhes(n.chamadoId, true);
    } else if (titulo === 'Solicitação de Transferência') {
      // Técnico recebe -> Vai para Aba 1 (Recebidos)
      if (isTecnico)
        this.router.navigate(['/tecnico/atendimento/listar'], {
          queryParams: { tab: 1 },
        });
    } else if (
      titulo === 'Transferência Cancelada' ||
      titulo === 'Transferência Aceita' ||
      titulo === 'Transferência Recusada' ||
      titulo === 'Chamado Reaberto'
    ) {
      // Técnico recebe feedback -> Vai para Aba 0 (Meus Chamados/Fila)
      if (isTecnico)
        this.router.navigate(['/tecnico/atendimento/listar'], {
          queryParams: { tab: 0 },
        });
      else this.navegarParaDetalhes(n.chamadoId);
    } else if (titulo === 'Chamado Resolvido') {
      // Usuário -> Vai para lista (avaliar)
      // Técnico -> Vai para detalhes
      if (!isTecnico) this.router.navigate(['/chamado/listar']);
      else this.navegarParaDetalhes(n.chamadoId);
    } else {
      // Padrão -> Detalhes
      this.navegarParaDetalhes(n.chamadoId);
    }
  }

  private navegarParaDetalhes(id: number, abrirChat: boolean = false) {
    const params = abrirChat ? { queryParams: { openChat: 'true' } } : {};
    
    // Define a URL base de destino
    let urlDestino = '';
    if (this.perfilUsuario === HeaderPerfilEnum.TECNICO_TI) {
      urlDestino = `/tecnico/atendimento/${id}/detalhes`;
    } else {
      urlDestino = `/chamado/${id}/detalhes`;
    }

    // CORREÇÃO: Verifica se já estamos na URL de destino
    // O split('?')[0] ignora query params para comparar apenas a rota
    const urlAtual = this.router.url.split('?')[0];

    if (urlAtual === urlDestino) {
      // TRUQUE: Navega para uma rota vazia e volta imediatamente para recarregar o componente
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([urlDestino], params);
      });
    } else {
      // Navegação normal
      this.router.navigate([urlDestino], params);
    }
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
}
