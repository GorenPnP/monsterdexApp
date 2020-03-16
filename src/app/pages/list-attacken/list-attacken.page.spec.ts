import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAttackenPage } from './list-attacken.page';

describe('ListAttackenPage', () => {
  let component: ListAttackenPage;
  let fixture: ComponentFixture<ListAttackenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListAttackenPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAttackenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
