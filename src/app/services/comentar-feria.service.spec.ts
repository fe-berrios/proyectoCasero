import { TestBed } from '@angular/core/testing';

import { ComentarFeriaService } from './comentar-feria.service';

describe('ComentarFeriaService', () => {
  let service: ComentarFeriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComentarFeriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
