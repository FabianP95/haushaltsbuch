import styles from './overview-header.module.scss';
import { formatCurrency } from '@/utils/currency';

export function OverviewHeader({
    totalTransactions,
    totalExpenseSum,
    totalIncomeSum,
    currentBalance, }:
    {
        totalTransactions: number;
        totalExpenseSum: number;
        totalIncomeSum: number;
        currentBalance: number;
    }) {
    return (
        <header className={styles.header}>
            <div className={styles.heading}>
                <h2 className={styles.title}>Übersicht</h2>
                <p className={styles.subtitle}>
                    {totalTransactions}{' '}
                    {totalTransactions === 1 ? 'Umsatz' : 'Umsätze'} gefunden
                </p>
            </div>
            <div className={`${styles.totalBadge} ${currentBalance < 0 ? styles.negativeContainer : styles.positiveContainer}`}>
                <span className={styles.totalLabel}>Gesamt:</span>
                <span
                    className={`${styles.totalAmount} ${currentBalance < 0 ? styles.negative : styles.positive}`}
                >
                    {formatCurrency(currentBalance)}
                </span>
            </div>
            <div className={`${styles.totalBadge} ${styles.incomeContainer}`}>
                <span className={styles.totalLabelIncome}>Einnahmen:</span>
                <span className={styles.totalAmountIncome}>{formatCurrency(totalIncomeSum)}</span>
            </div>
            <div className={`${styles.totalBadge} ${styles.expenseContainer}`}>
                <span className={styles.totalLabelExpense}>Ausgaben:</span>
                <span className={styles.totalAmountExpense}>{formatCurrency(totalExpenseSum)}</span>
            </div>
        </header>);
}

