import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingComponent } from './components/loading/loading.component';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'incident-manager-frontend';
  constructor(private router: Router) {}

  mostrarMenu(): boolean {
    const url = this.router.url.split('?')[0];
    if (url === '/') return false;
    if (url === '/login') return false;
    if (url === '/recuperar-senha') return false;
    if (url.startsWith('/redefinir-senha')) return false;
    if (url.startsWith('/definir-senha')) return false;
    return true;
  }
}
