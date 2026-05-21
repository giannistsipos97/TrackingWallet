import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AddAccountDialogComponent } from './add-account-dialog.component';

describe('AddAccountDialogComponent', () => {
  let component: AddAccountDialogComponent;
  let fixture: ComponentFixture<AddAccountDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAccountDialogComponent],
      providers: [
        provideHttpClient(), // Fixes AccountService -> HttpClient error
        provideHttpClientTesting(), // Mock backend context runner
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAccountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
