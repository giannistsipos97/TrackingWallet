import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ViewAllTransactionsComponent } from './view-all-transactions.component';

describe('ViewAllTransactionsComponent', () => {
  let component: ViewAllTransactionsComponent;
  let fixture: ComponentFixture<ViewAllTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllTransactionsComponent],
      providers: [
        provideHttpClient(), // Fixes injected services -> HttpClient error
        provideHttpClientTesting(), // Mock backend infrastructure runner
        provideRouter([]), // Handles router queries or navigation hooks safely
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewAllTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
