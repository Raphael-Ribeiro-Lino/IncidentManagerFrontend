import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlterarMeusDadosComponent } from './alterar-meus-dados.component';

describe('AlterarMeusDadosComponent', () => {
  let component: AlterarMeusDadosComponent;
  let fixture: ComponentFixture<AlterarMeusDadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlterarMeusDadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlterarMeusDadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
