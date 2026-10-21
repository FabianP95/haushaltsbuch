'use client';
import { useState, useMemo, useEffect } from 'react';

import styles from './page.module.scss'

import { getAllData, createTransaction, updateTransaction, deleteTransaction, createCategory, updateCategory, deleteCategory } from './data/data';
import { Category, FinanceSummary, FormPreset, MainView, NewCategory, NewTransaction, SelectedPeriod, Transaction } from './interfaces/interfaces';
import { Data } from './interfaces/interfaces';
import { filterTransactions, getAvailableYears } from '@/utils/date-filter';

import ExpenseOverview from "./components/overview/expense-overview";
import AddEntry from './components/add-entry/add-entry';
import Sidebar from "./components/sidebar/sidebar";
import Navbar from './components/navbar/navbar';
import CategoryManager from './components/category-manager/category-manager';
import Charts from './components/charts/charts';

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

  const [activeView, setActiveView] = useState<MainView>('list');

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


  /**
   * Saves a new category and appends it to the local state, so filter, form and overview show it immediately.
   * @param newCategory - Category data from the management form
   */
  async function handleCreateCategory(newCategory: NewCategory) {
    const created = await createCategory(newCategory);
    setData((prev) => prev && { ...prev, categories: [...(prev.categories ?? []), created] });
  }


  /**
   * Saves a changed category and replaces it in the local state.
   * @param category - The edited category (same id as before)
   */
  async function handleUpdateCategory(category: Category) {
    const updated = await updateCategory(category);
    setData((prev) => prev && {
      ...prev,
      categories: (prev.categories ?? []).map((c) => (c.id === updated.id ? updated : c))
    });
  }


  /**
   * Deletes a category and moves its transactions to the target category in storage and local state.
   * @param categoryId - Id of the category to delete
   * @param targetCategoryId - Category that receives the transactions, `null` if there are none
   */
  async function handleDeleteCategory(categoryId: string, targetCategoryId: string | null) {
    try {
      await deleteCategory(categoryId, targetCategoryId);
    } catch (error) {
      console.warn('Kategorie konnte nicht gelöscht werden.', error);
      return;
    }

    const now = new Date().toISOString();

    setData((prev) => prev && {
      ...prev,
      categories: (prev.categories ?? []).filter((c) => c.id !== categoryId),
      transactions: (prev.transactions ?? []).map((t) =>
        t.categoryId === categoryId && targetCategoryId ? { ...t, categoryId: targetCategoryId, updatedAt: now } : t
      )
    });


    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId('all');
    }


    if (formPreset.editingTransaction?.categoryId === categoryId || formPreset.categoryId === categoryId) {
      resetForm();
    }
  }



  /**
   * Called from the pie chart: sets the category filter and shows the matching transactions.
   * @param categoryId - Id of the clicked category
   */
  function handleChartCategorySelect(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setActiveView('list');
  }



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
          currentBalance={summary.currentBalance}
          activeView={activeView}
          onSelectView={setActiveView} />

        <div className={styles.mainView}>


          {activeView === 'list' ? (
            <ExpenseOverview
              categories={data.categories}
              transactions={filteredTransactions}
              selectedCategoryId={selectedCategoryId}
              selectedPeriod={selectedPeriod}
              onSelectCategory={setSelectedCategoryId}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onAddToCategory={handleAddToCategory}
              onUpdateCategory={handleUpdateCategory} />
          ) : (
            <Charts
              categories={data.categories ?? []}
              transactions={data.transactions ?? []}
              selectedPeriod={selectedPeriod}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleChartCategorySelect} />
          )}


          <div className={styles.sideColumn}>
            <AddEntry
              key={formPreset.version}
              categories={data.categories ?? []}
              editingTransaction={formPreset.editingTransaction}
              presetCategoryId={formPreset.categoryId}
              onAdd={handleAddTransaction}
              onUpdate={handleUpdateTransaction}
              onCancel={resetForm} />

            <CategoryManager
              categories={data.categories ?? []}
              transactions={data.transactions ?? []}
              onCreate={handleCreateCategory}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory} />
          </div>
        </div>
      </div>


    </div>
  );
}
