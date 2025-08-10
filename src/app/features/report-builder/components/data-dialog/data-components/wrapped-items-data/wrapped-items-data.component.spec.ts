import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrappedItemsDataComponent } from './wrapped-items-data.component';

describe('WrappedItemsDataComponent', () => {
  let component: WrappedItemsDataComponent;
  let fixture: ComponentFixture<WrappedItemsDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WrappedItemsDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WrappedItemsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
