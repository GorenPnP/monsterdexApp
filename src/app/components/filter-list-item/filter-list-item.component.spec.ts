import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FilterListItemComponent } from './filter-list-item.component';

describe('FilterListItemComponent', () => {
  let component: FilterListItemComponent;
  let fixture: ComponentFixture<FilterListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterListItemComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
