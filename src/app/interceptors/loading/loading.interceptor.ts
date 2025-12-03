import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingService } from '../../services/loading/loading.service';
import { finalize, Observable } from 'rxjs';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private readonly MIN_LOADING_TIME = 1000; // 1 segundo mínimo

  constructor(private loadingService: LoadingService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // 1. VERIFICAÇÃO DE SKIP
    // Se a requisição tiver o cabeçalho "X-Skip-Loading", ignoramos a lógica de loading
    if (request.headers.has('X-Skip-Loading')) {
      const newRequest = request.clone({
        headers: request.headers.delete('X-Skip-Loading'),
      });
      return next.handle(newRequest);
    }

    // 2. LÓGICA PADRÃO (Para todas as outras requisições)
    const startTime = Date.now();

    if (this.activeRequests === 0) {
      this.loadingService.show();
    }

    this.activeRequests++;

    return next.handle(request).pipe(
      finalize(() => {
        this.activeRequests--;

        const elapsed = Date.now() - startTime;
        const remainingTime = this.MIN_LOADING_TIME - elapsed;

        if (this.activeRequests === 0) {
          if (remainingTime > 0) {
            setTimeout(() => {
              // Verifica novamente se ainda é 0 (caso tenha entrado outra req no timeout)
              if (this.activeRequests === 0) {
                this.loadingService.hide();
              }
            }, remainingTime);
          } else {
            this.loadingService.hide();
          }
        }
      })
    );
  }
}
