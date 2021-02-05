import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MonsterDetailPage } from './monster-detail.page';

describe('MonsterDetailPage', () => {
  let component: MonsterDetailPage;
  let fixture: ComponentFixture<MonsterDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonsterDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MonsterDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
