import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticTableDataComponent } from './static-table-data.component';

describe('StaticTableDataComponent', () => {
  let component: StaticTableDataComponent;
  let fixture: ComponentFixture<StaticTableDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaticTableDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaticTableDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
