import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMotivoRecusaComponent } from './modal-motivo-recusa.component';

describe('ModalMotivoRecusaComponent', () => {
  let component: ModalMotivoRecusaComponent;
  let fixture: ComponentFixture<ModalMotivoRecusaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMotivoRecusaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMotivoRecusaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
