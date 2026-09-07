import { TestBed } from '@angular/core/testing';

import { InsuranceStateService } from './insurance-state.service';

describe('InsuranceStateService', () => {
  let service: InsuranceStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsuranceStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
