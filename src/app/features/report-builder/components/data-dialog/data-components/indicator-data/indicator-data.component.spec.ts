import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorDataComponent } from './indicator-data.component';

describe('IndicatorDataComponent', () => {
  let component: IndicatorDataComponent;
  let fixture: ComponentFixture<IndicatorDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndicatorDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndicatorDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
