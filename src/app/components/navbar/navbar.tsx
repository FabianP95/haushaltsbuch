import styles from './navbar.module.scss'
import Image from 'next/image';
import { OverviewHeader } from './overview-header/overview-header';
import { FinanceSummary } from '@/app/interfaces/interfaces';

/**
 * Top bar with the finance summary and the chart button.
 * @param props - Transaction count, expense sum, income sum and balance
 * @returns The navbar
 */
export default function Navbar({
  totalTransactions,
  totalExpenseSum,
  totalIncomeSum,
  currentBalance
}: FinanceSummary) {


  return (
    <div className={styles.nav}>
      <OverviewHeader
        totalTransactions={totalTransactions}
        totalExpenseSum={totalExpenseSum}
        totalIncomeSum={totalIncomeSum}
        currentBalance={currentBalance} 
      />
      <div>
        <button className={styles.diaBtn}>Diagramm <Image className={styles.navIcon} src="/assets/icons/bar_chart.svg" alt="chart icon" width={30} height={30} /></button>
      </div>
    </div>
  );
}
