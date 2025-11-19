import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExibirDetalhesComponent } from './exibir-detalhes.component';

describe('ExibirDetalhesComponent', () => {
  let component: ExibirDetalhesComponent;
  let fixture: ComponentFixture<ExibirDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExibirDetalhesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExibirDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
