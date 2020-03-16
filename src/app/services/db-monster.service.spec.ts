import { TestBed } from '@angular/core/testing';

import { DbMonsterService } from './db-monster.service';

describe('DbMonsterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DbMonsterService = TestBed.get(DbMonsterService);
    expect(service).toBeTruthy();
  });
});
