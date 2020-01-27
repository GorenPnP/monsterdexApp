import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTypenPage } from './list-typen.page';

describe('ListTypenPage', () => {
  let component: ListTypenPage;
  let fixture: ComponentFixture<ListTypenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTypenPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTypenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
