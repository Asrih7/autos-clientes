import { TestBed } from '@angular/core/testing';

import { P3ModelosService } from './p3-modelos.service';

describe('P3ModelosService', () => {
  let service: P3ModelosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(P3ModelosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
