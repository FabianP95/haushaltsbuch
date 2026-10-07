import { Transaction } from '@/app/interfaces/interfaces';

/**
 * Checks whether a transaction matches the search term (description text or amount).
 * Text search is case-insensitive and finds partial words.
 * Amount search accepts comma or dot and finds the digits anywhere, e.g. "12" finds 120, 21,12 and 3012.
 * @param transaction - Transaction to check
 * @param searchTerm - Raw text from the search field
 * @returns `true` if the transaction should stay visible
 */
export function matchesSearch(transaction: Transaction, searchTerm: string): boolean {
    const term = searchTerm.trim();
    if (term === '') return true;


    const description = (transaction.description ?? '').toLocaleLowerCase('de-DE');
    if (description.includes(term.toLocaleLowerCase('de-DE'))) return true;


    const numericTerm = term.replace(',', '.');

    if (Number.isNaN(Number(numericTerm))) return false;


    const amountText = transaction.amount.toFixed(2);

    return amountText.includes(numericTerm);
}
