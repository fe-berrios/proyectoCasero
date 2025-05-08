import { TestBed } from '@angular/core/testing';

import { FeriaService } from './feria.service';

describe('FeriaService', () => {
  let service: FeriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
