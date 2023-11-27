import { TestBed } from '@angular/core/testing';

import { CanvasDrawService } from './canvas-draw.service';

describe('CanvasDrawService', () => {
  let service: CanvasDrawService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasDrawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
