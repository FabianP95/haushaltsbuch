import { CategoryFilterBarProps } from '@/app/interfaces/interfaces';
import styles from './filterbar.module.scss';


export function CategoryFilterBar({
    categories,
    selectedCategoryId,
    onSelectCategory,
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
        </div>
    );
}