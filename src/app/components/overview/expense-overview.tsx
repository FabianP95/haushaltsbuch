'use client';
import { useMemo, useState } from 'react';
import { Category, ExpenseOverviewProps, CategoryGroup, Transaction } from '@/app/interfaces/interfaces';
import { CategoryGroupCard } from './category-group/catgeory-group';
import { CategoryFilterBar } from './filterbar/filterbar';
import styles from './expense-overview.module.scss';
import { matchesSearch } from '@/utils/search';


const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_TRANSACTIONS: Transaction[] = [];


const UNCATEGORIZED: Category = {
    id: 'uncategorized',
    name: 'Ohne Kategorie',
    icon: '❓',
    color: '#888888',
};

/**
 * Overview with category filter bar and the transactions grouped by category.
 * @param props - Categories, transactions, selected category and the select callback
 * @returns The overview area
 */
export default function ExpenseOverview({
    categories,
    transactions,
    selectedCategoryId,
    onSelectCategory
}: ExpenseOverviewProps) {

    
    const [searchTerm, setSearchTerm] = useState('');

    const safeCategories = categories ?? EMPTY_CATEGORIES;
    const safeTransactions = transactions ?? EMPTY_TRANSACTIONS;

    
    const searchedTransactions = useMemo(
        () => safeTransactions.filter((t) => matchesSearch(t, searchTerm)),
        [safeTransactions, searchTerm]
    );

    const categoryMap = useMemo(() => {
        const map = new Map<string, Category>();
        safeCategories.forEach((category) => map.set(category.id, category));
        return map;
    }, [safeCategories]);


    const groupedData = useMemo(() => {

        const groups: CategoryGroup[] = [];

        safeCategories.forEach((category) => {
            if (selectedCategoryId !== 'all' && category.id !== selectedCategoryId) {
                return
            }
            const groupTransactions = searchedTransactions.filter(
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

        
        const orphanedTransactions = searchedTransactions.filter((t) => !categoryMap.has(t.categoryId));
        if (selectedCategoryId === 'all' && orphanedTransactions.length > 0) {
            groups.push({
                category: UNCATEGORIZED,
                transactions: orphanedTransactions,
                totalAmount: orphanedTransactions.reduce((sum, t) => sum + t.amount, 0),
            });
        }

        return groups;


    }, [safeCategories, searchedTransactions, selectedCategoryId, categoryMap]);

    
    const isUnknownCategorySelected = selectedCategoryId !== 'all' && !categoryMap.has(selectedCategoryId);

    
    const emptyMessage = safeCategories.length === 0
        ? 'Keine Kategorien vorhanden.'
        : isUnknownCategorySelected
            ? 'Die gewählte Kategorie wurde nicht gefunden.'
           
            : searchTerm.trim() !== '' && safeTransactions.length > 0
                ? `Keine Buchungen zur Suche „${searchTerm.trim()}“ gefunden.`
                : 'Keine Buchungen im gewählten Zeitraum gefunden.';


    return (
        <div className={styles.overviewContainer}>
            <CategoryFilterBar
                categories={safeCategories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={onSelectCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <main className={styles.content}>
                {groupedData.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>{emptyMessage}</p>
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
