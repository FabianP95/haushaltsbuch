'use client';
import { useState, useCallback } from 'react';

import styles from './page.module.scss'

import { FinanceSummary } from './interfaces/interfaces';

import ExpenseOverview from "./components/overview/expense-overview";
import AddEntry from './components/add-entry/add-entry';
import Sidebar from "./components/sidebar/sidebar";
import Navbar from './components/navbar/navbar';

export default function Home() {

  const [summary, setSummary] = useState<FinanceSummary>({
    totalTransactions: 0,
    totalExpenseSum: 0,
    totalIncomeSum: 0,
    currentBalance: 0
  })

  const handleSummaryChange = useCallback((summaryValue: FinanceSummary) => {
    setSummary(summaryValue);
  }, []);



  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.mainContainer}>

        <Navbar
          totalTransactions={summary.totalTransactions}
          totalExpenseSum={summary.totalExpenseSum}
          totalIncomeSum={summary.totalIncomeSum}
          currentBalance={summary.currentBalance} />

        <div className={styles.mainView}>
          <ExpenseOverview onSummaryChange={handleSummaryChange}/>
          <AddEntry />
        </div>
      </div>


    </div>
  );
}
