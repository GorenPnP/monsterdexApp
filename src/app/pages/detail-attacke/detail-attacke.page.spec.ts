import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailAttackePage } from './detail-attacke.page';

describe('DetailAttackePage', () => {
  let component: DetailAttackePage;
  let fixture: ComponentFixture<DetailAttackePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailAttackePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailAttackePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
