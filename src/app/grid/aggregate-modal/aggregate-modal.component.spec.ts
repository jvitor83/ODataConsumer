import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregateModalComponent } from './aggregate-modal.component';

describe('AggregateModalComponent', () => {
  let component: AggregateModalComponent;
  let fixture: ComponentFixture<AggregateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
