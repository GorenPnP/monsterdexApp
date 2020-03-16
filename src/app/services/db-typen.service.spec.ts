import { TestBed } from '@angular/core/testing';

import { DbTypenService } from './db-typen.service';

describe('DbTypenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DbTypenService = TestBed.get(DbTypenService);
    expect(service).toBeTruthy();
  });
});
