import { TestBed } from '@angular/core/testing';

import { P2MarcasService } from './p2-marcas.service';

describe('P2MarcasService', () => {
  let service: P2MarcasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(P2MarcasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
