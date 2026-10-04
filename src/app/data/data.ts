// import { API } from "./config";
import { STORAGE_KEY } from './config';
import { Data, NewTransaction, Transaction } from '@/app/interfaces/interfaces';
import { testCategories, testTransactions } from '@/app/data/testdata';


const initialData: Data = {
    categories: testCategories,
    transactions: testTransactions
};


function isValidData(value: unknown): value is Data {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Data;
    return Array.isArray(candidate.categories) && Array.isArray(candidate.transactions);
}


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


function writeStorage(data: Data): void {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Daten konnten nicht gespeichert werden.', error);
    }
}


function getCurrentData(): Data {
    return readStorage() ?? initialData;
}

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


export async function updateTransaction(transaction: Transaction): Promise<Transaction> {
    const updated: Transaction = { ...transaction, updatedAt: new Date().toISOString() };
    const data = getCurrentData();
    const transactions = (data.transactions ?? []).map((t) => (t.id === updated.id ? updated : t));
    writeStorage({ ...data, transactions });
    return updated;
}


export async function deleteTransaction(id: string): Promise<void> {
    const data = getCurrentData();
    
    const transactions = (data.transactions ?? []).filter((t) => t.id !== id);
    writeStorage({ ...data, transactions });
}
