import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AttackDetailPage } from './attack-detail.page';

describe('AttackDetailPage', () => {
  let component: AttackDetailPage;
  let fixture: ComponentFixture<AttackDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttackDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AttackDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
