import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EditBalanceModalComponent } from './edit-balance-modal.component';

describe('EditBalanceModalComponent', () => {
  let component: EditBalanceModalComponent;
  let fixture: ComponentFixture<EditBalanceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBalanceModalComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EditBalanceModalComponent);
    component = fixture.componentInstance;

    (component as any).account = { balance: 0 };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
