import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVisualizarChamadoComponent } from './modal-visualizar-chamado.component';

describe('ModalVisualizarChamadoComponent', () => {
  let component: ModalVisualizarChamadoComponent;
  let fixture: ComponentFixture<ModalVisualizarChamadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalVisualizarChamadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalVisualizarChamadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
