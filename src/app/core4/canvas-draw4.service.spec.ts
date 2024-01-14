import { TestBed } from '@angular/core/testing';

import { CanvasDraw4Service } from './canvas-draw4.service';

describe('CanvasDraw4Service', () => {
  let service: CanvasDraw4Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasDraw4Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
