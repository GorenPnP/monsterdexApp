import { TestBed } from '@angular/core/testing';

import { FullHeaderService } from './full-header.service';

describe('FullHeaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FullHeaderService = TestBed.get(FullHeaderService);
    expect(service).toBeTruthy();
  });
});
