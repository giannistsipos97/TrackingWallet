import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Observable, tap } from 'rxjs';
import { Account } from '../models/Account';
import { AccountService } from '../services/account.service';
import { Transaction } from '../models/Transaction';

type AccountSummary = {
  income: number;
  expenses: number;
};

type AccountsState = {
  accounts: Account[];
  accountsLoaded: boolean;
  selectedAccount: Account | null;
  selectedAccountTransactions: Transaction[];
  selectedAccountSummary: AccountSummary | null;
  loading: boolean;
  error: string | null;
  detailsLoading: boolean;
  detailsError: string | null;
  deletingAccount: boolean;
  deleteError: string | null;
};

const initialState: AccountsState = {
  accounts: [],
  accountsLoaded: false,
  selectedAccount: null,
  selectedAccountTransactions: [],
  selectedAccountSummary: null,
  loading: false,
  error: null,
  detailsLoading: false,
  detailsError: null,
  deletingAccount: false,
  deleteError: null,
};

export const AccountsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ accounts }) => ({
    hasAccounts: computed(() => accounts().length > 0),
  })),
  withMethods((store, accountService = inject(AccountService)) => {
    let latestDetailsRequestId = 0;

    return {
    loadAccounts(force = false): void {
      if (!force && store.accountsLoaded()) {
        return;
      }

      patchState(store, { loading: true, error: null });

      accountService.getAccounts().subscribe({
        next: (accounts) => {
          patchState(store, {
            accounts,
            accountsLoaded: true,
            loading: false,
          });
        },
        error: () => {
          patchState(store, {
            loading: false,
            error: 'Failed to load accounts',
          });
        },
      });
    },
    loadAccountDetails(accountId: string, clearExisting = true): void {
      const requestId = ++latestDetailsRequestId;

      patchState(store, {
        selectedAccount: clearExisting ? null : store.selectedAccount(),
        selectedAccountTransactions: clearExisting
          ? []
          : store.selectedAccountTransactions(),
        selectedAccountSummary: clearExisting
          ? null
          : store.selectedAccountSummary(),
        detailsLoading: true,
        detailsError: null,
      });

      accountService.getAccountById(accountId).subscribe({
        next: ({ account, transactions, summary }) => {
          if (requestId !== latestDetailsRequestId) {
            return;
          }

          patchState(store, {
            selectedAccount: account,
            selectedAccountTransactions: transactions,
            selectedAccountSummary: summary,
            detailsLoading: false,
          });
        },
        error: () => {
          if (requestId !== latestDetailsRequestId) {
            return;
          }

          patchState(store, {
            detailsLoading: false,
            detailsError: 'Failed to load account details',
          });
        },
      });
    },
    deleteAccount(accountId: string): Observable<unknown> {
      patchState(store, { deletingAccount: true, deleteError: null });

      return accountService.deleteAccount(accountId).pipe(
        tap({
          next: () => {
            patchState(store, (state) => ({
              accounts: state.accounts.filter(
                (account) => account._id !== accountId,
              ),
              selectedAccount:
                state.selectedAccount?._id === accountId
                  ? null
                  : state.selectedAccount,
              selectedAccountTransactions:
                state.selectedAccount?._id === accountId
                  ? []
                  : state.selectedAccountTransactions,
              selectedAccountSummary:
                state.selectedAccount?._id === accountId
                  ? null
                  : state.selectedAccountSummary,
              deletingAccount: false,
            }));
          },
          error: () => {
            patchState(store, {
              deletingAccount: false,
              deleteError: 'Failed to delete account',
            });
          },
        }),
      );
    },
    updateAccount(updatedAccount: Account): void {
      patchState(store, (state) => ({
        accounts: state.accounts.map((account) =>
          account._id === updatedAccount._id ? updatedAccount : account,
        ),
        selectedAccount:
          state.selectedAccount?._id === updatedAccount._id
            ? updatedAccount
            : state.selectedAccount,
      }));
    },
    };
  }),
);
