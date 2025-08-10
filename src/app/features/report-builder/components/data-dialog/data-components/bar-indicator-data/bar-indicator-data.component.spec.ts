import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarIndicatorDataComponent } from './bar-indicator-data.component';

describe('BarIndicatorDataComponent', () => {
  let component: BarIndicatorDataComponent;
  let fixture: ComponentFixture<BarIndicatorDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BarIndicatorDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BarIndicatorDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
