import { TransactionItemProps } from '@/app/interfaces/interfaces';
import styles from './transaction-item.module.scss';
// Next.js image component: optimizes and lazy-loads images instead of a plain <img>
import Image from 'next/image';
import { formatCurrency } from '@/utils/currency';

/**
 * Single transaction row with description, date, recurrence badge, amount and action buttons.
 * @param props - The transaction and a map to look up its category
 * @returns The transaction row
 */
export function TransactionItem({
    transaction,
    categoryMap,
    onEdit,
    onDelete,
}: TransactionItemProps) {
    const category = categoryMap.get(transaction.categoryId);



    const formattedDate = new Date(transaction.date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const isIncome = transaction.type === 'Einnahme';

    return (
        <article className={styles.transactionItem}>
            <div className={styles.itemLeft}>
                <div className={styles.itemMeta}>
                    <div className={styles.itemTitleRow}>
                        <span className={styles.itemDescription}>
                            {transaction.description || category?.name || 'Ausgabe'}
                        </span>
                    </div>
                    <div className={styles.itemDetails}>
                        <span className={styles.itemDate}>{formattedDate}</span>
                        {transaction.isRecurring && (
                            <span className={styles.recurringBadge} title={`Intervall: ${transaction.recurrenceInterval}`}>
                                🔄 {transaction.recurrenceInterval}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.itemRight}>
                <span className={isIncome ? styles.itemAmountPositiv : styles.itemAmountNegativ}>
                    {isIncome ? '' : '-'}{formatCurrency(transaction.amount)}
                </span>

                <button className={styles.workOnBtn} onClick={() => onEdit(transaction)}>
                    <Image src="/assets/icons/edit.svg" alt="Buchung bearbeiten" width={20} height={20} />
                </button>

                <button className={styles.workOnBtn} onClick={() => onDelete(transaction)}>
                    <Image src="/assets/icons/delete.svg" alt="Buchung löschen" width={20} height={20} />
                </button>
            </div>
        </article>
    );
}