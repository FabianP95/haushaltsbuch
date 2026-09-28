'use client';
import { useState, useMemo, useEffect } from 'react';

import styles from './page.module.scss'

import { getAllData } from './data/data';
import { FinanceSummary } from './interfaces/interfaces';
import { Data } from './interfaces/interfaces';

import ExpenseOverview from "./components/overview/expense-overview";
import AddEntry from './components/add-entry/add-entry';
import Sidebar from "./components/sidebar/sidebar";
import Navbar from './components/navbar/navbar';

export default function Home() {

 
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  useEffect(() => {
    
    async function loadData() {
      try {
        const dbData = await getAllData();
        setData(dbData);
      } catch {
       
        setLoadError('Daten konnten nicht geladen werden.');
      }
    }
    loadData();
  }, []);

  
  const summary = useMemo<FinanceSummary>(() => {
    const transactions = data?.transactions ?? [];

    
    const filteredTransactions = selectedCategoryId === 'all'
      ? transactions
      : transactions.filter((t) => t.categoryId === selectedCategoryId);

    const totalExpenseSum = filteredTransactions
      .filter((t) => t.type === 'Ausgabe')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncomeSum = filteredTransactions
      .filter((t) => t.type === 'Einnahme')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTransactions: filteredTransactions.length,
      totalExpenseSum,
      totalIncomeSum,
      currentBalance: totalIncomeSum - totalExpenseSum
    };
  }, [data, selectedCategoryId]);

  
  if (loadError) {
    return <p>{loadError}</p>;
  }

  if (!data) {
    return <p>Daten werden geladen …</p>;
  }

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

          
          <ExpenseOverview
            categories={data.categories}
            transactions={data.transactions}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId} />
          <AddEntry />
        </div>
      </div>


    </div>
  );
}
