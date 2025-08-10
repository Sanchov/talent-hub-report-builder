import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartTableIndicatorDataComponent } from './chart-table-indicator-data.component';

describe('ChartTableIndicatorDataComponent', () => {
  let component: ChartTableIndicatorDataComponent;
  let fixture: ComponentFixture<ChartTableIndicatorDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChartTableIndicatorDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChartTableIndicatorDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
