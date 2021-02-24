import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TypeSplitpanePage } from './type-splitpane.page';

describe('TypeSplitpanePage', () => {
  let component: TypeSplitpanePage;
  let fixture: ComponentFixture<TypeSplitpanePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeSplitpanePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TypeSplitpanePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
