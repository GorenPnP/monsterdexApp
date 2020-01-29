import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcTypPage } from './calc-typ.page';

describe('CalcTypPage', () => {
  let component: CalcTypPage;
  let fixture: ComponentFixture<CalcTypPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalcTypPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcTypPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
