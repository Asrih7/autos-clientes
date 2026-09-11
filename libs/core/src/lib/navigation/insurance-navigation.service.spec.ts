import { TestBed } from '@angular/core/testing';

import { InsuranceNavigationService } from './insurance-navigation.service';

describe('InsuranceNavigationService', () => {
  let service: InsuranceNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsuranceNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
