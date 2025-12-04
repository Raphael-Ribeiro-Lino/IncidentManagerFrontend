import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { interval, Subscription, switchMap } from 'rxjs';

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

  // Notificações
  notificacoes: NotificacaoOutput[] = [];
  unreadCount: number = 0;
  private pollingSubscription!: Subscription;

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

      // Inicia o polling do contador
      this.iniciarPollingNotificacoes();
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  // Atualiza o contador a cada 30 segundos
  iniciarPollingNotificacoes() {
    // Primeira chamada imediata
    this.atualizarContador();

    this.pollingSubscription = interval(10000).subscribe(() => {
      this.atualizarContador();
    });
  }

  atualizarContador() {
    this.notificacaoService.contarNaoLidas(this.token).subscribe({
      next: (count) => (this.unreadCount = count),
      error: () => console.error('Erro ao buscar notificações'),
    });
  }

  // Chamado quando clica no sino para abrir o menu
  abrirMenuNotificacoes() {
    // Busca as últimas 10 notificações
    this.notificacaoService.listar(this.token, 0, 10).subscribe((page) => {
      this.notificacoes = page.content;
      // Atualiza o contador para garantir sincronia
      this.atualizarContador();
    });
  }

  lerNotificacao(notificacao: NotificacaoOutput) {
    // 1. Marca como lida no backend (se não estiver)
    if (!notificacao.lido) {
      this.notificacaoService
        .marcarComoLida(this.token, notificacao.id)
        .subscribe(() => {
          notificacao.lido = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        });
    }

    // 2. Navega para o chamado
    // Verifica o perfil para saber a rota correta
    if (this.perfilUsuario === HeaderPerfilEnum.TECNICO_TI) {
      this.router.navigate([
        '/tecnico/atendimento',
        notificacao.chamadoId,
        'detalhes',
      ]);
    } else {
      this.router.navigate(['/chamado', notificacao.chamadoId, 'detalhes']);
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

  // Helper para ícone visual
  getIconeNotificacao(tipo: string): string {
    switch (tipo) {
      case TipoNotificacaoEnum.NOVA_MENSAGEM:
        return 'chat';
      case TipoNotificacaoEnum.MUDANCA_STATUS:
        return 'sync_alt';
      case TipoNotificacaoEnum.RESOLUCAO:
        return 'check_circle';
      case TipoNotificacaoEnum.TRANSFERENCIA:
        return 'forward';
      case TipoNotificacaoEnum.REABERTURA:
        return 'replay';
      default:
        return 'notifications';
    }
  }
}
