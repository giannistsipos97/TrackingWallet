import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(), // Core HTTP client support
        provideHttpClientTesting(), // Mock backend handler for login/auth requests
        provideRouter([]),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should share in-flight profile requests and use the cached profile afterwards', () => {
    const profile = {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    };
    const responses: unknown[] = [];

    service.getUserProfile().subscribe((user) => responses.push(user));
    service.getUserProfile().subscribe((user) => responses.push(user));

    const request = httpMock.expectOne('http://localhost:3000/api/auth/me');
    request.flush(profile);

    expect(responses).toEqual([profile, profile]);
    expect(service.currentUser()).toEqual(profile);

    service.getUserProfile().subscribe((user) => responses.push(user));

    httpMock.expectNone('http://localhost:3000/api/auth/me');
    expect(responses).toEqual([profile, profile, profile]);
  });
});
