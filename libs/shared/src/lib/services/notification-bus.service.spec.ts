import { TestBed } from '@angular/core/testing';

import { NotificationBusService } from './notification-bus.service';

describe('NotificationBusService', () => {
  let service: NotificationBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
