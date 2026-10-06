import { TestBed } from '@angular/core/testing';

import { AutoInsuranceApiService } from './auto-insurance-api.service';

describe('AutoInsuranceApiService', () => {
  let service: AutoInsuranceApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoInsuranceApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
