import { TestBed } from '@angular/core/testing';

import { ReportBuilderFormService } from './report-builder-form.service';

describe('ReportBuilderFormService', () => {
  let service: ReportBuilderFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportBuilderFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
