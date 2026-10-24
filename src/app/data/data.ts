'use server';
// 'use server' turns every exported function into a Server Action: the client calls it, but it runs on the PC server

import { getDb, toCategory, toTransaction } from './db';
import { Category, Data, NewCategory, NewTransaction, Transaction } from '@/app/interfaces/interfaces';


/**
 * Loads all categories and transactions from the database.
 * @returns The complete data object
 */
export async function getAllData(): Promise<Data> {
    const db = getDb();
    const categories = db.prepare('SELECT * FROM categories').all().map(toCategory);
    const transactions = db.prepare('SELECT * FROM transactions').all().map(toTransaction);
    return { categories, transactions };
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

    // the ? placeholders are filled in order and protect against SQL injection
    getDb().prepare(`
        INSERT INTO transactions (id, type, amount, categoryId, description, date, isRecurring,
            recurrenceInterval, recurrenceEndDate, recurrenceParentId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        transaction.id,
        transaction.type,
        transaction.amount,
        transaction.categoryId,
        transaction.description ?? null,
        transaction.date,
        transaction.isRecurring ? 1 : 0,
        transaction.recurrenceInterval ?? null,
        transaction.recurrenceEndDate ?? null,
        transaction.recurrenceParentId ?? null,
        transaction.createdAt,
        transaction.updatedAt
    );

    return transaction;
}


/**
 * Replaces a stored transaction (matched by id) and refreshes its `updatedAt` timestamp.
 * @param transaction - The changed transaction
 * @returns The updated transaction
 */
export async function updateTransaction(transaction: Transaction): Promise<Transaction> {
    const updated: Transaction = { ...transaction, updatedAt: new Date().toISOString() };

    getDb().prepare(`
        UPDATE transactions SET type = ?, amount = ?, categoryId = ?, description = ?, date = ?, isRecurring = ?,
            recurrenceInterval = ?, recurrenceEndDate = ?, recurrenceParentId = ?, updatedAt = ?
        WHERE id = ?
    `).run(
        updated.type,
        updated.amount,
        updated.categoryId,
        updated.description ?? null,
        updated.date,
        updated.isRecurring ? 1 : 0,
        updated.recurrenceInterval ?? null,
        updated.recurrenceEndDate ?? null,
        updated.recurrenceParentId ?? null,
        updated.updatedAt,
        updated.id
    );

    return updated;
}


/**
 * Removes the transaction with the given id from the database.
 * @param id - Id of the transaction to delete
 */
export async function deleteTransaction(id: string): Promise<void> {
    getDb().prepare('DELETE FROM transactions WHERE id = ?').run(id);
}


/**
 * Creates a category with a generated id and stores it.
 * @param newCategory - Category data without id
 * @returns The newly created category
 */
export async function createCategory(newCategory: NewCategory): Promise<Category> {
    const category: Category = { ...newCategory, id: crypto.randomUUID() };

    getDb().prepare('INSERT INTO categories (id, name, color, monthlyBudget) VALUES (?, ?, ?, ?)')
        .run(category.id, category.name, category.color, category.monthlyBudget ?? null);

    return category;
}


/**
 * Replaces a stored category (matched by id).
 * @param category - The changed category
 * @returns The updated category
 */
export async function updateCategory(category: Category): Promise<Category> {
    getDb().prepare('UPDATE categories SET name = ?, color = ?, monthlyBudget = ? WHERE id = ?')
        .run(category.name, category.color, category.monthlyBudget ?? null, category.id);

    return category;
}


/**
 * Deletes a category and moves its transactions to another category, so no transaction is left without a category.
 * @param id - Id of the category to delete
 * @param targetCategoryId - Category that receives the transactions, `null` if the category has no transactions
 * @throws If the category still has transactions but no valid target category is given
 */
export async function deleteCategory(id: string, targetCategoryId: string | null): Promise<void> {
    const db = getDb();

    const hasTransactions = db.prepare('SELECT 1 FROM transactions WHERE categoryId = ? LIMIT 1').get(id) !== undefined;
    // the target must exist and must not be the category that gets deleted
    const targetExists = targetCategoryId !== null && targetCategoryId !== id
        && db.prepare('SELECT 1 FROM categories WHERE id = ?').get(targetCategoryId) !== undefined;

    if (hasTransactions && !targetExists) {
        throw new Error('Kategorie mit Buchungen braucht eine Zielkategorie.');
    }

    // BEGIN/COMMIT runs both statements as one unit: either both succeed or nothing changes
    db.exec('BEGIN');
    try {
        if (hasTransactions) {
            db.prepare('UPDATE transactions SET categoryId = ?, updatedAt = ? WHERE categoryId = ?')
                .run(targetCategoryId, new Date().toISOString(), id);
        }
        db.prepare('DELETE FROM categories WHERE id = ?').run(id);
        db.exec('COMMIT');
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
}
