import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticNoteDataComponent } from './static-note-data.component';

describe('StaticNoteDataComponent', () => {
  let component: StaticNoteDataComponent;
  let fixture: ComponentFixture<StaticNoteDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaticNoteDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaticNoteDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
