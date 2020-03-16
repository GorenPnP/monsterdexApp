import { TestBed } from '@angular/core/testing';

import { TypPopupService } from './typ-popup.service';

describe('TypPopupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypPopupService = TestBed.get(TypPopupService);
    expect(service).toBeTruthy();
  });
});
