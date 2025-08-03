import { TestBed } from '@angular/core/testing';

import { NarrativeService } from './narrative.service';

describe('NarrativeService', () => {
  let service: NarrativeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NarrativeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
