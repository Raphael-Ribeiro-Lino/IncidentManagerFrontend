import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefinirSenhaComponent } from './definir-senha.component';

describe('DefinirSenhaComponent', () => {
  let component: DefinirSenhaComponent;
  let fixture: ComponentFixture<DefinirSenhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefinirSenhaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefinirSenhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
