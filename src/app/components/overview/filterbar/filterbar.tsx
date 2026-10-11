import { CategoryFilterBarProps } from '@/app/interfaces/interfaces';
import styles from './filterbar.module.scss';
import { SORT_OPTIONS, isSortOption } from '@/utils/sort';


/**
 * Dropdown to filter the overview by category, a search field for amount / description and a sort dropdown.
 * @param props - Categories, the selected category id, the search term, the sort option and their callbacks
 * @returns The filter bar
 */
export function CategoryFilterBar({
    categories,
    selectedCategoryId,
    onSelectCategory,
    searchTerm,
    onSearchChange,
    sortOption,
    onSortChange,
}: CategoryFilterBarProps) {
    return (
        <div className={styles.filterBar}>
            <label htmlFor="category-select" className={styles.filterLabel}>
                Filter nach Kategorie:
            </label>
            <select
                id="category-select"
                className={styles.filterSelect}
                value={selectedCategoryId}
                onChange={(e) => onSelectCategory(e.target.value)}
            >
                <option value="all">Alle Kategorien</option>
                {categories.map((category) => {
                    return (
                        <option key={category.id} value={category.id}>
                            {category.icon ? `${category.icon} ` : ''}
                            {category.name}
                        </option>
                    );
                })}
            </select>

          
            <label htmlFor="transaction-search" className={styles.visuallyHidden}>
                Buchungen durchsuchen
            </label>
            <input
                id="transaction-search"
                type="search"
                className={styles.searchInput}
                placeholder="Betrag oder Beschreibung suchen"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            {/* Visually hidden label so screen readers announce what the dropdown does */}
            <label htmlFor="sort-select" className={styles.visuallyHidden}>
                Buchungen sortieren
            </label>
            <select
                id="sort-select"
                className={styles.filterSelect}
                value={sortOption}
                // Type guard turns the plain string from the <select> into the union type
                onChange={(e) => isSortOption(e.target.value) && onSortChange(e.target.value)}
            >
                {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}