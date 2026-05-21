import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should create the theme service instance cleanly', () => {
    expect(service).toBeTruthy();
  });

  it('should default to false if localStorage is empty', () => {
    expect(service.isDarkMode()).toBeFalse();
  });

  it('should invert the isDarkMode signal state when toggleTheme() is called', () => {
    const initialMode = service.isDarkMode();

    service.toggleTheme();
    expect(service.isDarkMode()).toBe(!initialMode);

    service.toggleTheme();
    expect(service.isDarkMode()).toBe(initialMode);
  });
});
