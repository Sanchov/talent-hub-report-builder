import { TestBed } from '@angular/core/testing';

import { ReportBuilderDataService } from './report-builder-data.service';

describe('ReportBuilderDataService', () => {
  let service: ReportBuilderDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportBuilderDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
