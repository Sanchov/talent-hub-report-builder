import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfBreakDataComponent } from './pdf-break-data.component';

describe('PdfBreakDataComponent', () => {
  let component: PdfBreakDataComponent;
  let fixture: ComponentFixture<PdfBreakDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfBreakDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PdfBreakDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
