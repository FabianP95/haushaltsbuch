import styles from './navbar.module.scss'
import { OverviewHeader } from './overview-header/overview-header';
import { FinanceSummary } from '@/app/interfaces/interfaces';

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
        <button className={styles.diaBtn}>Diagramm <img className={styles.navIcon} src="/assets/icons/bar_chart.svg" alt="chart icon" /></button>
      </div>
    </div>
  );
}
