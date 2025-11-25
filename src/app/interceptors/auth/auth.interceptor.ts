import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { DialogData } from '../../models/dialogData/dialogData';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const dialog = inject(MatDialog);
  const token = localStorage.getItem('token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        if (dialog.openDialogs.length === 0) {
          localStorage.removeItem('token');

          const dialogData: DialogData = {
            titulo: 'Sessão Expirada',
            mensagem:
              'Sua sessão expirou por segurança. Por favor, faça login novamente.',
            icone: 'lock_clock',
            textoConfirmar: 'Ir para Login',
            corBotao: 'primary',
            mostrarCancelar: false,
          };

          const dialogRef = dialog.open(ConfirmationDialogComponent, {
            data: dialogData,
            width: '400px',
            disableClose: true,
          });

          dialogRef.afterClosed().subscribe(() => {
            router.navigate(['/login']);
          });
        }
      }

      return throwError(() => error);
    })
  );
};
