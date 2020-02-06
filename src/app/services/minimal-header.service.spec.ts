import { TestBed } from '@angular/core/testing';

import { MinimalHeaderService } from './minimal-header.service';

describe('MinimalHeaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MinimalHeaderService = TestBed.get(MinimalHeaderService);
    expect(service).toBeTruthy();
  });
});
