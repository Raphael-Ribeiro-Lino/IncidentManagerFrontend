import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReabrirComponent } from './modal-reabrir.component';

describe('ModalReabrirComponent', () => {
  let component: ModalReabrirComponent;
  let fixture: ComponentFixture<ModalReabrirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalReabrirComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalReabrirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
