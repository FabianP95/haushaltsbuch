'use client';
import { useState, useMemo, useEffect } from 'react';

import styles from './page.module.scss'

import { getAllData, createTransaction, updateTransaction, deleteTransaction } from './data/data';
import { FinanceSummary, FormPreset, NewTransaction, SelectedPeriod, Transaction } from './interfaces/interfaces';
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
 
  const [formPreset, setFormPreset] = useState<FormPreset>({ version: 0, editingTransaction: null });

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


  /**
   * Saves a changed transaction, replaces it in the local state and switches the form back to create mode.
   * @param transaction - The edited transaction (same id as before)
   */
  async function handleUpdateTransaction(transaction: Transaction) {
    const updated = await updateTransaction(transaction);
    setData((prev) => prev && {
      ...prev,
      transactions: (prev.transactions ?? []).map((t) => (t.id === updated.id ? updated : t))
    });
    resetForm();
  }


  /**
   * Deletes a single transaction.
   * Recurring transactions: only this one entry is removed, linked entries stay untouched.
   * @param transaction - The transaction to delete
   */
  async function handleDeleteTransaction(transaction: Transaction) {
    

    await deleteTransaction(transaction.id);

    
    setData((prev) => prev && {
      ...prev,
      transactions: (prev.transactions ?? []).filter((t) => t.id !== transaction.id)
    });

    if (formPreset.editingTransaction?.id === transaction.id) {
      resetForm();
    }
  }


  /**
   * Opens the entry form in edit mode for the given transaction.
   * @param transaction - The transaction to edit
   */
  function handleEditTransaction(transaction: Transaction) {
    
    setFormPreset((prev) => ({ version: prev.version + 1, editingTransaction: transaction }));
  }


  /**
   * Opens the entry form in create mode with the given category preselected (ends a running edit mode).
   * @param categoryId - Id of the category to preselect
   */
  function handleAddToCategory(categoryId: string) {
    setFormPreset((prev) => ({ version: prev.version + 1, editingTransaction: null, categoryId }));
  }


  /** Switches the entry form back to an empty create mode. */
  function resetForm() {
    setFormPreset((prev) => ({ version: prev.version + 1, editingTransaction: null }));
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
            onSelectCategory={setSelectedCategoryId}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onAddToCategory={handleAddToCategory} />
         
          <AddEntry
            key={formPreset.version}
            categories={data.categories ?? []}
            editingTransaction={formPreset.editingTransaction}
            presetCategoryId={formPreset.categoryId}
            onAdd={handleAddTransaction}
            onUpdate={handleUpdateTransaction}
            onCancel={resetForm} />
        </div>
      </div>


    </div>
  );
}
