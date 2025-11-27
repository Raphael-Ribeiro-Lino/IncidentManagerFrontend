import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotaInternaComponent } from './modal-nota-interna.component';

describe('ModalNotaInternaComponent', () => {
  let component: ModalNotaInternaComponent;
  let fixture: ComponentFixture<ModalNotaInternaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNotaInternaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalNotaInternaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
