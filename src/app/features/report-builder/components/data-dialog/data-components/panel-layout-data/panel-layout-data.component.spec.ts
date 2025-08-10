import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelLayoutDataComponent } from './panel-layout-data.component';

describe('PanelLayoutDataComponent', () => {
  let component: PanelLayoutDataComponent;
  let fixture: ComponentFixture<PanelLayoutDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PanelLayoutDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PanelLayoutDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
