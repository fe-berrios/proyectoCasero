import { TestBed } from '@angular/core/testing';

import { SolicitudCaseroService } from './solicitud-casero.service';

describe('SolicitudCaseroService', () => {
  let service: SolicitudCaseroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolicitudCaseroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
