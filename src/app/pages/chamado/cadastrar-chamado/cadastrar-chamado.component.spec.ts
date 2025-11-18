import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarChamadoComponent } from './cadastrar-chamado.component';

describe('CadastrarChamadoComponent', () => {
  let component: CadastrarChamadoComponent;
  let fixture: ComponentFixture<CadastrarChamadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarChamadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CadastrarChamadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
