import { TestBed } from '@angular/core/testing';
import { HeaderService } from './header.service';

describe('HeaderService', () => {
  let service: HeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeaderService],
    });

    service = TestBed.inject(HeaderService);
  });

  it('should create the header service instance cleanly', () => {
    expect(service).toBeTruthy();
  });
});
