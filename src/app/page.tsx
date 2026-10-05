'use client';
import { useState, useMemo, useEffect } from 'react';

import styles from './page.module.scss'

import { getAllData, createTransaction } from './data/data';
import { FinanceSummary, NewTransaction, SelectedPeriod } from './interfaces/interfaces';
import { Data } from './interfaces/interfaces';
import { filterTransactions, getAvailableYears } from '@/utils/date-filter';

import ExpenseOverview from "./components/overview/expense-overview";
import AddEntry from './components/add-entry/add-entry';
import Sidebar from "./components/sidebar/sidebar";
import Navbar from './components/navbar/navbar';

/**
 * Main page: loads the data, holds the filter state and composes sidebar, navbar, overview and entry form.
 * @returns The home page
 */
export default function Home() {

  
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });

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


  /**
   * Saves a new transaction and appends it to the local state so the UI updates immediately.
   * @param newTransaction - Transaction data from the entry form
   */
  async function handleAddTransaction(newTransaction: NewTransaction) {
    const created = await createTransaction(newTransaction);

    setData((prev) => prev && { ...prev, transactions: [...(prev.transactions ?? []), created] });
  }


  
  const availableYears = useMemo(
    () => getAvailableYears(data?.transactions ?? [], new Date().getFullYear()),
    [data]
  );

  
  const filteredTransactions = useMemo(
    () => filterTransactions(data?.transactions ?? [], selectedPeriod, selectedCategoryId),
    [data, selectedPeriod, selectedCategoryId]
  );


  const summary = useMemo<FinanceSummary>(() => {
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
  }, [filteredTransactions]);


  if (loadError) {
    return <p>{loadError}</p>;
  }

  if (!data) {
    return <p>Daten werden geladen …</p>;
  }

  return (
    <div className={styles.container}>
      <Sidebar
        years={availableYears}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod} />
      <div className={styles.mainContainer}>

        <Navbar
          totalTransactions={summary.totalTransactions}
          totalExpenseSum={summary.totalExpenseSum}
          totalIncomeSum={summary.totalIncomeSum}
          currentBalance={summary.currentBalance} />

        <div className={styles.mainView}>


          <ExpenseOverview
            categories={data.categories}
            transactions={filteredTransactions}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId} />
          <AddEntry onAdd={handleAddTransaction} />
        </div>
      </div>


    </div>
  );
}
