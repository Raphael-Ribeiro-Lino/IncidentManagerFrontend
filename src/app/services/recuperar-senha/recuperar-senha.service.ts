import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmailRedefinirSenhaInput } from '../../models/recuperar-senha/recuperarSenhaInput';

const URL_API = environment.URL_API + "/usuario/redefinir-senha";

@Injectable({
  providedIn: 'root'
})
export class RecuperarSenhaService {

  constructor(private http: HttpClient) { }

  enviarEmailParaRedefinirSenha(emailRedefinirSenhaInput: EmailRedefinirSenhaInput): Observable<void> {
    return this.http.post<void>(URL_API, emailRedefinirSenhaInput);
  }
}

