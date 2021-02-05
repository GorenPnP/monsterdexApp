import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MonsterListPage } from './monster-list.page';

describe('MonsterListPage', () => {
  let component: MonsterListPage;
  let fixture: ComponentFixture<MonsterListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonsterListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MonsterListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
