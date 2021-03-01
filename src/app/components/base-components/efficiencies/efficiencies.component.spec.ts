import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EfficienciesComponent } from './efficiencies.component';

describe('EfficienciesComponent', () => {
  let component: EfficienciesComponent;
  let fixture: ComponentFixture<EfficienciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfficienciesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EfficienciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
