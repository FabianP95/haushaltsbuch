// import { API } from "./config";
import { STORAGE_KEY } from './config';
import { Data, NewTransaction, Transaction } from '@/app/interfaces/interfaces';
import { testCategories, testTransactions } from '@/app/data/testdata';


const initialData: Data = {
    categories: testCategories,
    transactions: testTransactions
};


/**
 * Type guard that checks whether an unknown value has the shape of `Data`.
 * @param value - Value parsed from storage
 * @returns `true` if categories and transactions are arrays
 */
function isValidData(value: unknown): value is Data {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Data;
    return Array.isArray(candidate.categories) && Array.isArray(candidate.transactions);
}


/**
 * Reads and validates the data stored in the localStorage.
 * @returns The stored data, or `null` if nothing valid is available (or on the server)
 */
function readStorage(): Data | null {
    
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        
        const parsed: unknown = JSON.parse(raw);
        return isValidData(parsed) ? parsed : null;
    } catch {
        
        return null;
    }
}


/**
 * Writes the data to the localStorage and logs a warning if saving fails.
 * @param data - Complete data object to persist
 */
function writeStorage(data: Data): void {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Daten konnten nicht gespeichert werden.', error);
    }
}


/**
 * Returns the stored data or falls back to the initial test data.
 * @returns The current data
 */
function getCurrentData(): Data {
    return readStorage() ?? initialData;
}

/**
 * Loads all categories and transactions (async to imitate a later backend call).
 * @returns The complete data object
 */
export async function getAllData(): Promise<Data> {
    return getCurrentData();

    // const response = await fetch(API, { method: 'GET' });
    //
    // // fetch only rejects on network errors, not on 404/500 -> check status first
    // if (!response.ok) {
    //     throw new Error(`Failed to load data (status ${response.status})`);
    // }
    //
    // return await response.json() as Data;
}


/**
 * Creates a transaction with a generated id and timestamps and stores it.
 * @param newTransaction - Transaction data without id and timestamps
 * @returns The newly created transaction
 */
export async function createTransaction(newTransaction: NewTransaction): Promise<Transaction> {
    const now = new Date().toISOString();

  
    const transaction: Transaction = {
        ...newTransaction,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
    };

    const data = getCurrentData();
    
    writeStorage({ ...data, transactions: [...(data.transactions ?? []), transaction] });

    return transaction;
}


/**
 * Replaces a stored transaction (matched by id) and refreshes its `updatedAt` timestamp.
 * @param transaction - The changed transaction
 * @returns The updated transaction
 */
export async function updateTransaction(transaction: Transaction): Promise<Transaction> {
    const updated: Transaction = { ...transaction, updatedAt: new Date().toISOString() };
    const data = getCurrentData();
    const transactions = (data.transactions ?? []).map((t) => (t.id === updated.id ? updated : t));
    writeStorage({ ...data, transactions });
    return updated;
}


/**
 * Removes the transaction with the given id from the storage.
 * @param id - Id of the transaction to delete
 */
export async function deleteTransaction(id: string): Promise<void> {
    const data = getCurrentData();
    
    const transactions = (data.transactions ?? []).filter((t) => t.id !== id);
    writeStorage({ ...data, transactions });
}
