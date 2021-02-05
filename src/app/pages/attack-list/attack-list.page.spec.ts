import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AttackListPage } from './attack-list.page';

describe('AttackListPage', () => {
  let component: AttackListPage;
  let fixture: ComponentFixture<AttackListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttackListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AttackListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
