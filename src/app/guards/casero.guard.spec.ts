import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { caseroGuard } from './casero.guard';

describe('caseroGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => caseroGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
