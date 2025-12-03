import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChatMensagemOutput } from '../../models/chamado/chatMensagemOutput';
import { Observable } from 'rxjs';

const API_URL = environment.URL_API + '/chamado';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) {}

  listarMensagens(
    token: string,
    chamadoId: number,
    skipLoading: boolean = false
  ): Observable<ChatMensagemOutput[]> {
    let headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    if (skipLoading) {
      headers = headers.append('X-Skip-Loading', 'true');
    }

    return this.http.get<ChatMensagemOutput[]>(
      `${API_URL}/${chamadoId}/chat`,
      { headers }
    );
  }

  enviarMensagem(
    token: string,
    chamadoId: number,
    conteudo: string,
    privado: boolean,
    arquivos: File[]
  ): Observable<ChatMensagemOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const formData = new FormData();
    formData.append('conteudo', conteudo || '');
    formData.append('privado', String(privado));

    if (arquivos && arquivos.length > 0) {
      arquivos.forEach((file) => {
        formData.append('arquivos', file);
      });
    }

    return this.http.post<ChatMensagemOutput>(
      `${API_URL}/${chamadoId}/chat`,
      formData,
      { headers }
    );
  }
}
