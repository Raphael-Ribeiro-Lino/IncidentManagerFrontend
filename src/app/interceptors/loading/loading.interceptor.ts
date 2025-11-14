import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
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
              this.loadingService.hide();
            }, remainingTime);
          } else {
            this.loadingService.hide();
          }
        }
      })
    );
  }
}
