import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDataMask]',
  standalone: true,
})
export class DataMaskDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    if (value.length >= 5) {
      value = value.replace(/^(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
    } else if (value.length >= 3) {
      value = value.replace(/^(\d{2})(\d+)/, '$1/$2');
    }

    input.value = value;
  }
}
