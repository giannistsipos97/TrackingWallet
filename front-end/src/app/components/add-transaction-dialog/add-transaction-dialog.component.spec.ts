import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AddTransactionDialogComponent } from './add-transaction-dialog.component';

describe('AddTransactionDialogComponent', () => {
  let component: AddTransactionDialogComponent;
  let fixture: ComponentFixture<AddTransactionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTransactionDialogComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTransactionDialogComponent);
    component = fixture.componentInstance;

    (component as any).account = { name: 'Default Account' };

    component.categories.set([
      {
        _id: 'mock-cat-id',
        name: 'Default Category',
        color: '#ffffff',
      },
    ]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
