import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RedefinirSenhaInput } from '../../models/redefinir-senha/redefinirSenhaInput';

const API_URL = environment.URL_API + "/usuario/";

@Injectable({
  providedIn: 'root'
})
export class DefinirSenhaService {

  constructor(private httpClient: HttpClient) { }

     verificaHash(hash: string | null): Observable<void> {
      return this.httpClient.get<void>(API_URL + `definir-senha/${hash}`);
    }
  
    definirSenha(definirSenhaInput: RedefinirSenhaInput, hash: string | null): Observable<void> {
      return this.httpClient.put<void>(API_URL + `definir-senha/${hash}`, definirSenhaInput);
    }
}
