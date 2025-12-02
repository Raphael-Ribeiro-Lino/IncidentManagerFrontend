import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  // Sobrescreve o método de LEITURA da data (do input para o modelo)
  override parse(value: any): Date | null {
    // Se for texto e tiver barra (ex: "15/01/2025")
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const str = value.split('/');

      const day = Number(str[0]);
      const month = Number(str[1]) - 1; // Mês no JS começa em 0
      const year = Number(str[2]);

      // Cria a data
      const date = new Date(year, month, day);

      // Valida se a data é real (ex: impede 32/01)
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return date;
      }
    }

    // Se não for nosso formato, deixa o padrão tentar
    return super.parse(value);
  }

  // Sobrescreve a formatação de exibição (opcional, mas garante consistência)
  override format(date: Date, displayFormat: Object): string {
    // Se for o formato de input, força dd/MM/yyyy
    if (displayFormat === 'input') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Para outros formatos (ex: cabeçalho do calendário), usa o padrão do locale pt-BR
    return super.format(date, displayFormat);
  }
}
