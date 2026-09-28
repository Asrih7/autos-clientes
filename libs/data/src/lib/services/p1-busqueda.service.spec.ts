import { TestBed } from '@angular/core/testing';

import { P1BusquedaService } from './p1-busqueda.service';

describe('P1BusquedaService', () => {
  let service: P1BusquedaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(P1BusquedaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
