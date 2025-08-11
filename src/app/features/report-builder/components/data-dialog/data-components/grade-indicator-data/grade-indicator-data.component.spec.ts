import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeIndicatorDataComponent } from './grade-indicator-data.component';

describe('GradeIndicatorDataComponent', () => {
  let component: GradeIndicatorDataComponent;
  let fixture: ComponentFixture<GradeIndicatorDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GradeIndicatorDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GradeIndicatorDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
