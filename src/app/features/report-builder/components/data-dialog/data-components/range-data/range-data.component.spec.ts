import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeDataComponent } from './range-data.component';

describe('RangeDataComponent', () => {
  let component: RangeDataComponent;
  let fixture: ComponentFixture<RangeDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RangeDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RangeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
