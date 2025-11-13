import { TestBed } from '@angular/core/testing';

import { RecuperarSenhaService } from './recuperar-senha.service';

describe('RecuperarSenhaService', () => {
  let service: RecuperarSenhaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecuperarSenhaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
