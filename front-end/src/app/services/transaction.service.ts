import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/transactions';

  createTransaction(
    transaction: Transaction,
  ): Observable<{ transaction: Transaction; account: Account }> {
    return this.http.post<{ transaction: Transaction; account: Account }>(
      this.apiUrl,
      transaction,
    );
  }

  getAccountTransactions(accountId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/account/${accountId}`);
  }

  updateTransaction(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteTransaction(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
