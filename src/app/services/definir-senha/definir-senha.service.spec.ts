import { TestBed } from '@angular/core/testing';

import { DefinirSenhaService } from './definir-senha.service';

describe('DefinirSenhaService', () => {
  let service: DefinirSenhaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefinirSenhaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
