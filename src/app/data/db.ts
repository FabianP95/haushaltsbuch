import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { Category, RecurrenceInterval, Transaction, TransactionType } from '@/app/interfaces/interfaces';


// the database file lives in <project>/data and is created on first start
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'haushaltsbuch.db');

// categories inserted into a brand-new empty database; the ids must stay stable because existing transactions reference them
const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', name: 'Wohnen', color: '#185FA5' },
    { id: '2', name: 'Lebensmittel', color: '#3B6D11' },
    { id: '3', name: 'Freizeit', color: '#854F0B' },
    { id: '4', name: 'Mobilität', color: '#534AB7' },
    { id: '5', name: 'Gesundheit', color: '#A32D2D' },
    { id: '6', name: 'Versicherungen', color: '#5F5E5A' },
    { id: '7', name: 'Sparen & Anlegen', color: '#993C1D' },
    { id: '8', name: 'Bildung', color: '#993556' },
    { id: '9', name: 'Shopping', color: '#3C3489' },
    { id: '10', name: 'Drogerie', color: '#791F1F' },
    { id: '11', name: 'Urlaub', color: '#712B13' },
    { id: '12', name: 'Geschenke', color: '#72243E' },
    { id: '13', name: 'Spenden', color: '#633806' },
    { id: 'c14', name: 'Sonstiges', color: '#444441' },
    { id: '15', name: 'Gehalt & Zinsen', color: '#04342C' },
    { id: '16', name: 'Miete', color: '#085041' }
];

// a raw row as returned by SQLite (column name -> value)
type Row = Record<string, unknown>;

// keeps one open connection for the whole server process instead of reopening the file on every request
let connection: DatabaseSync | null = null;


/**
 * Creates the tables if they do not exist yet and inserts the default categories into an empty database.
 * @param db - Open database connection
 */
function setupDatabase(db: DatabaseSync): void {
    // IF NOT EXISTS makes this safe to run on every server start
    db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            monthlyBudget REAL
        );
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            categoryId TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            isRecurring INTEGER NOT NULL,
            recurrenceInterval TEXT,
            recurrenceEndDate TEXT,
            recurrenceParentId TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        );
    `);

    // only seed when no category exists yet, so user changes are never overwritten
    const { count } = db.prepare('SELECT COUNT(*) AS count FROM categories').get() as { count: number };
    if (count > 0) return;

    const insert = db.prepare('INSERT INTO categories (id, name, color, monthlyBudget) VALUES (?, ?, ?, ?)');
    for (const category of DEFAULT_CATEGORIES) {
        insert.run(category.id, category.name, category.color, category.monthlyBudget ?? null);
    }
}


/**
 * Returns the shared database connection and opens it on first use.
 * @returns The open SQLite connection
 */
export function getDb(): DatabaseSync {
    if (connection) return connection;

    // recursive: true does nothing if the folder already exists
    mkdirSync(DB_DIR, { recursive: true });
    connection = new DatabaseSync(DB_FILE);
    setupDatabase(connection);
    return connection;
}


/**
 * Turns SQL `NULL` into `undefined`, because the interfaces use optional fields instead of `null`.
 * @param value - Column value from SQLite
 * @returns The value or `undefined`
 */
function optional<T>(value: unknown): T | undefined {
    return value === null || value === undefined ? undefined : (value as T);
}


/**
 * Converts a database row into a `Category` object.
 * @param row - Row from the categories table
 * @returns The category
 */
export function toCategory(row: Row): Category {
    return {
        id: row.id as string,
        name: row.name as string,
        color: row.color as string,
        monthlyBudget: optional<number>(row.monthlyBudget)
    };
}


/**
 * Converts a database row into a `Transaction` object.
 * @param row - Row from the transactions table
 * @returns The transaction
 */
export function toTransaction(row: Row): Transaction {
    return {
        id: row.id as string,
        type: row.type as TransactionType,
        amount: row.amount as number,
        categoryId: row.categoryId as string,
        description: optional<string>(row.description),
        date: row.date as string,
        // SQLite has no boolean type, so it is stored as 0 / 1
        isRecurring: row.isRecurring === 1,
        recurrenceInterval: optional<RecurrenceInterval>(row.recurrenceInterval),
        recurrenceEndDate: optional<string>(row.recurrenceEndDate),
        recurrenceParentId: optional<string>(row.recurrenceParentId),
        createdAt: row.createdAt as string,
        updatedAt: row.updatedAt as string
    };
}
