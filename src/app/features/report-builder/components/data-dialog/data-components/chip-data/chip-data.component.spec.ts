import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipDataComponent } from './chip-data.component';

describe('ChipDataComponent', () => {
  let component: ChipDataComponent;
  let fixture: ComponentFixture<ChipDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChipDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChipDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
