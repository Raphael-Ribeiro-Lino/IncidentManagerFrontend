import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarTransferenciasEnviadasComponent } from './listar-transferencias-enviadas.component';

describe('ListarTransferenciasEnviadasComponent', () => {
  let component: ListarTransferenciasEnviadasComponent;
  let fixture: ComponentFixture<ListarTransferenciasEnviadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarTransferenciasEnviadasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListarTransferenciasEnviadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
