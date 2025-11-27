import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAlterarStatusComponent } from './modal-alterar-status.component';

describe('ModalAlterarStatusComponent', () => {
  let component: ModalAlterarStatusComponent;
  let fixture: ComponentFixture<ModalAlterarStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAlterarStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAlterarStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
