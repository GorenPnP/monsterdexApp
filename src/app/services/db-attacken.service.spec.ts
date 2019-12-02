import { TestBed } from '@angular/core/testing';

import { DbAttackenService } from './db-attacken.service';

describe('DbAttackenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DbAttackenService = TestBed.get(DbAttackenService);
    expect(service).toBeTruthy();
  });
});
