'use client';
import { useState, useMemo, useEffect } from 'react';
import { Category, ExpenseOverviewProps, CategoryGroup } from '@/app/interfaces/interfaces';
import { testCategories, testTransactions } from '@/app/data/testdata';
import { CategoryGroupCard } from './category-group/catgeory-group';
import { CategoryFilterBar } from './filterbar/filterbar';
import { OverviewHeader } from '../navbar/overview-header/overview-header'
import styles from './expense-overview.module.scss';



export default function ExpenseOverview({
    categories = testCategories,
    transactions = testTransactions,
    onSummaryChange
}: ExpenseOverviewProps) {

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

    const expenseTransactions = useMemo(() => {
        return transactions.filter((t) => t.type === 'Ausgabe');
    }, [transactions]);

    const filteredExpenses = useMemo(() => {
        if (selectedCategoryId === 'all') {
            return expenseTransactions;
        }
        return expenseTransactions.filter((t) => t.categoryId === selectedCategoryId);
    }, [expenseTransactions, selectedCategoryId]);

    const totalExpenseSum = useMemo(() => {
        return filteredExpenses.reduce((sum, t) => sum + t.amount, 0);
    }, [filteredExpenses]);


    const incomeTransactions = useMemo(() => {
        return transactions.filter((t) => t.type === 'Einnahme');
    }, [transactions])

    const filteredIncomes = useMemo(() => {
        if (selectedCategoryId === 'all') {
            return incomeTransactions;
        }
        return incomeTransactions.filter((t) => t.categoryId === selectedCategoryId);
    }, [incomeTransactions, selectedCategoryId]);

    const totalIncomeSum = useMemo(() => {
        return filteredIncomes.reduce((sum, t) => sum + t.amount, 0);
    }, [filteredIncomes]);


    const currentBalance = useMemo(() => {
        return (totalIncomeSum - totalExpenseSum);
    }, [totalExpenseSum, totalIncomeSum]);


    const totalTransactions = useMemo(() => {
        if (selectedCategoryId === 'all') {
            return transactions.length
        }
        else {
            const filteredTransactions = transactions.filter((t) => t.categoryId === selectedCategoryId);
            return filteredTransactions.length;
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        onSummaryChange?.({
            totalTransactions,
            totalExpenseSum,
            totalIncomeSum,
            currentBalance,
        });
    }, [totalTransactions, totalExpenseSum, totalIncomeSum, currentBalance, onSummaryChange]);




    const categoryMap = useMemo(() => {
        const map = new Map<string, Category>();
        categories.forEach((category) => map.set(category.id, category));
        return map;
    }, [categories]);


    const groupedData = useMemo(() => {

        const groups: CategoryGroup[] = [];

        categories.forEach((category) => {
            if (selectedCategoryId !== 'all' && category.id !== selectedCategoryId) {
                return
            }
            const groupTransactions = transactions.filter(
                (t) => t.categoryId === category.id
            );

            if (groupTransactions.length === 0) return;

            const totalAmount = groupTransactions.reduce((sum, t) => sum + t.amount, 0);

            groups.push({
                category,
                transactions: groupTransactions,
                totalAmount,
            });
        });

        return groups;


    }, [categories, transactions, selectedCategoryId]);


    return (
        <div className={styles.overviewContainer}>
            <CategoryFilterBar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
            />

            <main className={styles.content}>
                {groupedData.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Keine Ausgaben gefunden.</p>
                    </div>
                ) : (
                    groupedData.map((group) => (
                        <CategoryGroupCard
                            key={group.category.id}
                            group={group}
                            categoryMap={categoryMap}
                        />
                    ))
                )}
            </main>
        </div>
    );
}



