import { CategoryGroupCardProps } from '@/app/interfaces/interfaces';
import { TransactionItem } from './transaction-item/transaction-item';
import { formatCurrency } from '@/utils/currency';
import styles from './category-group.module.scss';

export function CategoryGroupCard({
    group,
    categoryMap,
}: CategoryGroupCardProps) {
    

    return (
        <section className={styles.groupCard}>
            <div className={styles.groupHeader} style={{ borderLeftColor: group.category.color }}>
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
                    <span className={styles.groupTotalAmount}>{formatCurrency(group.totalAmount)}</span>
                </div>
            </div>

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
        </section>
    );
}