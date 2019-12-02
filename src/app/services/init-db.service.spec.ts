import { TestBed } from '@angular/core/testing';

import { InitDbService } from './init-db.service';

describe('InitDbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InitDbService = TestBed.get(InitDbService);
    expect(service).toBeTruthy();
  });
});
