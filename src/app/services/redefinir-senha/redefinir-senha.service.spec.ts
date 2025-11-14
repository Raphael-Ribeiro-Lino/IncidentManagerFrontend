import { TestBed } from '@angular/core/testing';

import { RedefinirSenhaService } from './redefinir-senha.service';

describe('RedefinirSenhaService', () => {
  let service: RedefinirSenhaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RedefinirSenhaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
