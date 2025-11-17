import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlterarDadosUsuarioComponent } from './alterar-dados-usuario.component';

describe('AlterarDadosUsuarioComponent', () => {
  let component: AlterarDadosUsuarioComponent;
  let fixture: ComponentFixture<AlterarDadosUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlterarDadosUsuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlterarDadosUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
