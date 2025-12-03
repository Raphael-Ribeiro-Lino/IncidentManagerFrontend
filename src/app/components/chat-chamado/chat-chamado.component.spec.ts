import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatChamadoComponent } from './chat-chamado.component';

describe('ChatChamadoComponent', () => {
  let component: ChatChamadoComponent;
  let fixture: ComponentFixture<ChatChamadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatChamadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatChamadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
