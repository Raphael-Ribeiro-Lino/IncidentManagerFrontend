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
    ABERTO: 'Aberto',
    TRIAGEM: 'Triagem',
    EM_ATENDIMENTO: 'Em Atendimento',
    AGUARDANDO_CLIENTE: 'Aguardando Cliente',
    AGUARDANDO_PECA: 'Aguardando Peça',
    RESOLVIDO: 'Resolvido',
    CONCLUIDO: 'Concluído',
    REABERTO: 'Reaberto',
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

  // --- INTELIGÊNCIA DE TÍTULO E CONTEÚDO ---

  // Formata o texto da mensagem substituindo códigos por nomes bonitos
  formatarMensagem(mensagem: string): string {
    if (!mensagem) return '';
    let msgFormatada = mensagem;

    Object.keys(this.statusLabels).forEach((key) => {
      if (msgFormatada.includes(key)) {
        msgFormatada = msgFormatada.replace(key, this.statusLabels[key]);
      }
    });
    return msgFormatada;
  }

  // Define o título baseado no conteúdo da mensagem
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
          return 'Novo Chamado Atribuído';
        return 'Transferência';

      default:
        return 'Notificação';
    }
  }

  // Define a cor do ícone
  getClassByTipo(n: NotificacaoOutput): string {
    const titulo = this.getTituloInteligente(n);

    if (titulo === 'Nova Mensagem') return 'bg-blue';
    if (titulo === 'Chamado Resolvido' || titulo === 'Transferência Aceita')
      return 'bg-green';
    if (titulo === 'Chamado Reaberto' || titulo === 'Transferência Recusada')
      return 'bg-red';
    if (
      titulo === 'Solicitação de Transferência' ||
      titulo === 'Novo Chamado Atribuído'
    )
      return 'bg-purple';
    if (titulo === 'Transferência Cancelada') return 'bg-gray';

    return 'bg-gray';
  }

  // Define o ícone Material
  getIcone(n: NotificacaoOutput): string {
    const titulo = this.getTituloInteligente(n);

    if (titulo === 'Nova Mensagem') return 'chat';
    if (titulo === 'Chamado Resolvido') return 'check_circle';
    if (titulo === 'Chamado Reaberto') return 'replay';
    if (titulo === 'Transferência Aceita') return 'handshake';
    if (titulo === 'Transferência Recusada') return 'cancel';
    if (titulo === 'Transferência Cancelada') return 'block';
    if (titulo === 'Solicitação de Transferência') return 'move_to_inbox';
    if (titulo === 'Novo Chamado Atribuído') return 'assignment_ind';

    return 'notifications';
  }

  // --- NAVEGAÇÃO CENTRALIZADA ---

  clicarNotificacao(n: NotificacaoOutput) {
    // 1. Marca como lida visualmente e no backend
    if (!n.lido) {
      this.notificacaoService.marcarComoLida(this.token, n.id).subscribe();
      n.lido = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }

    const titulo = this.getTituloInteligente(n);
    const isTecnico = this.perfilUsuario === HeaderPerfilEnum.TECNICO_TI;

    // 2. Roteamento Inteligente
    if (titulo === 'Nova Mensagem') {
      this.navegarParaDetalhes(n.chamadoId, true);
    } else if (titulo === 'Solicitação de Transferência') {
      // Técnico recebe pedido -> Aba Recebidos (Tab 1)
      if (isTecnico) this.navegarParaListaTecnico(1);
    } else if (
      titulo === 'Transferência Cancelada' ||
      titulo === 'Transferência Aceita' ||
      titulo === 'Transferência Recusada' ||
      titulo === 'Chamado Reaberto'
    ) {
      // Técnico recebe feedback -> Aba Meus Chamados (Tab 0)
      if (isTecnico) this.navegarParaListaTecnico(0);
      else this.navegarParaDetalhes(n.chamadoId);
    } else if (titulo === 'Chamado Resolvido') {
      // Usuário vai para lista (avaliar), Técnico vai para detalhes
      if (!isTecnico) this.router.navigate(['/chamado/listar']);
      else this.navegarParaDetalhes(n.chamadoId);
    } else {
      // Padrão: Detalhes
      this.navegarParaDetalhes(n.chamadoId);
    }
  }

  // Navega para detalhes (Usuario ou Tecnico) e força reload se necessário
  private navegarParaDetalhes(id: number, abrirChat: boolean = false) {
    const params = abrirChat ? { queryParams: { openChat: 'true' } } : {};

    let urlDestino = '';
    if (this.perfilUsuario === HeaderPerfilEnum.TECNICO_TI) {
      urlDestino = `/tecnico/atendimento/${id}/detalhes`;
    } else {
      urlDestino = `/chamado/${id}/detalhes`;
    }

    this.forceNavigate(urlDestino, params);
  }

  // Navega para lista do técnico em uma aba específica
  private navegarParaListaTecnico(tabIndex: number) {
    const url = '/tecnico/atendimento/listar';
    const params = { queryParams: { tab: tabIndex } };
    this.forceNavigate(url, params);
  }

  // Lógica mágica para forçar recarregamento (Simula F5)
  private forceNavigate(url: string, extras: any) {
    const urlAtualSemParams = this.router.url.split('?')[0];

    // Se a rota base for a mesma, usa o skipLocationChange para recarregar
    if (urlAtualSemParams === url) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([url], extras);
      });
    } else {
      this.router.navigate([url], extras);
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
