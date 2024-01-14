import { TestBed } from '@angular/core/testing';

import { CanvasDraw3Service } from './canvas-draw3.service';

describe('CanvasDraw3Service', () => {
  let service: CanvasDraw3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasDraw3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
