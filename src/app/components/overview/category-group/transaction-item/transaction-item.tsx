import { TransactionItemProps } from '@/app/interfaces/interfaces';
import styles from './transaction-item.module.scss';
import { formatCurrency } from '@/utils/currency';

export function TransactionItem({
    transaction,
    categoryMap,
}: TransactionItemProps) {
    const category = categoryMap.get(transaction.categoryId);


    // Datum schön formatieren (ISO YYYY-MM-DD -> DD.MM.YYYY)
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
            </div>
        </article>
    );
}