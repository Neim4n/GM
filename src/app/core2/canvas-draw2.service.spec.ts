import { TestBed } from '@angular/core/testing';

import { CanvasDraw2Service } from './canvas-draw2.service';

describe('CanvasDraw2Service', () => {
  let service: CanvasDraw2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasDraw2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
