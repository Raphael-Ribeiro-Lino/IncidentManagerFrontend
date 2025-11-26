import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarMeusAtendimentosComponent } from './listar-meus-atendimentos.component';

describe('ListarMeusAtendimentosComponent', () => {
  let component: ListarMeusAtendimentosComponent;
  let fixture: ComponentFixture<ListarMeusAtendimentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarMeusAtendimentosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListarMeusAtendimentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
