import { CategoryFilterBarProps } from '@/app/interfaces/interfaces';
import styles from './filterbar.module.scss';


/**
 * Dropdown to filter the overview by category plus a search field for amount / description.
 * @param props - Categories, the selected category id, the search term and their callbacks
 * @returns The filter bar
 */
export function CategoryFilterBar({
    categories,
    selectedCategoryId,
    onSelectCategory,
    searchTerm,
    onSearchChange,
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
        </div>
    );
}