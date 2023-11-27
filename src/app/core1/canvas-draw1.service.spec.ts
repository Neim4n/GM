import { TestBed } from '@angular/core/testing';

import { CanvasDraw1Service } from './canvas-draw1.service';

describe('CanvasDraw1Service', () => {
  let service: CanvasDraw1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasDraw1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
