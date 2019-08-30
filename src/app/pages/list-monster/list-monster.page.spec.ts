import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMonsterPage } from './list-monster.page';

describe('ListMonsterPage', () => {
  let component: ListMonsterPage;
  let fixture: ComponentFixture<ListMonsterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListMonsterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListMonsterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
