import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSolicitarTransferenciaComponent } from './modal-solicitar-transferencia.component';

describe('ModalSolicitarTransferenciaComponent', () => {
  let component: ModalSolicitarTransferenciaComponent;
  let fixture: ComponentFixture<ModalSolicitarTransferenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSolicitarTransferenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalSolicitarTransferenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
