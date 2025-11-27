import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarTransferenciasPendentesComponent } from './listar-transferencias-pendentes.component';

describe('ListarTransferenciasPendentesComponent', () => {
  let component: ListarTransferenciasPendentesComponent;
  let fixture: ComponentFixture<ListarTransferenciasPendentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarTransferenciasPendentesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListarTransferenciasPendentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
