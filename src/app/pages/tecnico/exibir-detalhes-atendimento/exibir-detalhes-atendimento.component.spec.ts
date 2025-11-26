import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExibirDetalhesAtendimentoComponent } from './exibir-detalhes-atendimento.component';

describe('ExibirDetalhesAtendimentoComponent', () => {
  let component: ExibirDetalhesAtendimentoComponent;
  let fixture: ComponentFixture<ExibirDetalhesAtendimentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExibirDetalhesAtendimentoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExibirDetalhesAtendimentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
