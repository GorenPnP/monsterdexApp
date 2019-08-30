import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailMonsterPage } from './detail-monster.page';

describe('DetailMonsterPage', () => {
  let component: DetailMonsterPage;
  let fixture: ComponentFixture<DetailMonsterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailMonsterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailMonsterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
