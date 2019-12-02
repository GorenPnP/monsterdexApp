import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedMonsterPage } from './selected-monster.page';

describe('SelectedMonsterPage', () => {
  let component: SelectedMonsterPage;
  let fixture: ComponentFixture<SelectedMonsterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedMonsterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedMonsterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
