import { TestBed } from '@angular/core/testing';

import { DbImageService } from './db-image.service';

describe('DbImageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DbImageService = TestBed.get(DbImageService);
    expect(service).toBeTruthy();
  });
});
