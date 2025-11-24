export interface DialogData {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  corBotao?: 'primary' | 'accent' | 'warn';
  mostrarCancelar?: boolean;
  icone?: string;
}