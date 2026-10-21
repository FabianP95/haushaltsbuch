import styles from './navbar.module.scss'
import Image from 'next/image';
import { OverviewHeader } from './overview-header/overview-header';
import { MainViewOption, NavbarProps } from '@/app/interfaces/interfaces';

const MAIN_VIEW_OPTIONS: MainViewOption[] = [
  { value: 'list', label: 'Buchungen', icon: '/assets/icons/receipt_dark.svg' },
  { value: 'charts', label: 'Diagramm', icon: '/assets/icons/bar_chart.svg' },
];

/**
 * Top bar with the finance summary and the buttons to switch between transactions and charts.
 * @param props - Transaction count, expense sum, income sum, balance and the active view with its callback
 * @returns The navbar
 */
export default function Navbar({
  totalTransactions,
  totalExpenseSum,
  totalIncomeSum,
  currentBalance,
  activeView,
  onSelectView
}: NavbarProps) {


  return (
    <div className={styles.nav}>
      <OverviewHeader
        totalTransactions={totalTransactions}
        totalExpenseSum={totalExpenseSum}
        totalIncomeSum={totalIncomeSum}
        currentBalance={currentBalance} 
      />
      <div className={styles.viewButtons}>
        {MAIN_VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={activeView === option.value}
            className={`${styles.diaBtn} ${activeView === option.value ? styles.activeBtn : ''}`}
            onClick={() => onSelectView(option.value)}
          >
            {option.label}
            <Image className={styles.navIcon} src={option.icon} alt="" width={30} height={30} />
          </button>
        ))}
      </div>
    </div>
  );
}
