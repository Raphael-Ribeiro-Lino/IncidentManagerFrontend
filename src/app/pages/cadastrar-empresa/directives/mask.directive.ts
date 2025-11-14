import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMask]',
  standalone: true
})
export class MaskDirective {
  @Input('appMask') maskType!: 'cep' | 'cnpj' | 'uf';

  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let value = event.target.value;

    if (this.maskType === 'cep' || this.maskType === 'cnpj') {
      value = value.replace(/\D/g, '');
    }

    if (this.maskType === 'cep') {
      value = value.substring(0, 8);

      if (value.length > 5) {
        value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
      }
    }

    if (this.maskType === 'cnpj') {
      value = value.substring(0, 14);

      value = value
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    if (this.maskType === 'uf') {
      value = value
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .substring(0, 2);
    }

    this.ngControl.control?.setValue(value, { emitEvent: false });
  }
}
