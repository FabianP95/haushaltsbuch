import { useState } from 'react';
import { CategoryGroupCardProps } from '@/app/interfaces/interfaces';
import { TransactionItem } from './transaction-item/transaction-item';
import { formatCurrency } from '@/utils/currency';
import styles from './category-group.module.scss';

export function CategoryGroupCard({
    group,
    categoryMap,
}: CategoryGroupCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const netAmount = group.transactions.reduce((sum, tx) => {
        return tx.type === 'Einnahme' ? sum + tx.amount : sum - tx.amount;
    }, 0);

    const isPositiv = netAmount >= 0;

    return (
        <section className={styles.groupCard}>
            <div
                className={styles.groupHeader}
                style={{ borderLeftColor: group.category.color }}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
            >
                <div className={styles.groupInfo}>
                    <div className={styles.groupTitleInfo}>
                        <span className={styles.groupIcon} style={{ backgroundColor: `${group.category.color}20` }}>
                            {group.category.icon}
                        </span>
                        <div>
                            <h3 className={styles.groupName}>{group.category.name}</h3>
                            <span className={styles.groupCount}>
                                {group.transactions.length} {group.transactions.length === 1 ? 'Eintrag' : 'Einträge'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.groupTotal}>
                        <span className={styles.groupTotalLabel}>Summe:</span>
                        <span className={isPositiv ? styles.totalAmountPositiv : styles.totalAmountNegativ}>
                            {formatCurrency(netAmount)}
                        </span>
                    </div>
                </div>
                <img
                    src={isOpen ? '/assets/icons/expand_up.svg' : '/assets/icons/expand_down.svg'}
                    alt={isOpen ? 'Zuklappen' : 'Aufklappen'}
                    className={styles.chevron}
                />
            </div>

            <div className={`${styles.transactionListWrapper} ${isOpen ? styles.open : ''}`}>
                <div className={styles.transactionList}>
                    {group.transactions.length === 0 ? (
                        <div className={styles.noEntries}>Keine Ausgaben vorhanden</div>
                    ) : (
                        group.transactions.map((tx) => (
                            <TransactionItem
                                key={tx.id}
                                transaction={tx}
                                categoryMap={categoryMap}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}