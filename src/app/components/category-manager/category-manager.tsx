'use client';
import { useState, SubmitEvent } from 'react';
import Image from 'next/image';
import type { Category, CategoryManagerProps, NewCategory } from '@/app/interfaces/interfaces';
import { CATEGORY_ICONS, CATEGORY_NAME_MAX_LENGTH, CategoryErrors, checkCategory, parseBudgetInput } from '@/utils/category';
import { formatCurrency } from '@/utils/currency';
import { ErrorMessage } from '../add-entry/error-msg/error-msg';
import styles from './category-manager.module.scss';

const DEFAULT_ICON = CATEGORY_ICONS[0].icon;
const DEFAULT_COLOR = '#3d6b8a';

/**
 * Collapsible area to create, edit and delete categories including their monthly budget.
 * Deleting a category with transactions moves them to a chosen target category first.
 * @param props - Categories, all transactions (to count assignments) and the create/update/delete callbacks
 * @returns The category management area
 */
export default function CategoryManager({
    categories,
    transactions,
    onCreate,
    onUpdate,
    onDelete,
}: CategoryManagerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState(DEFAULT_ICON);
    const [color, setColor] = useState(DEFAULT_COLOR);
    const [budget, setBudget] = useState('');
    const [targetCategoryId, setTargetCategoryId] = useState('');
    const [errors, setErrors] = useState<CategoryErrors>({});

    const isEditMode = editingCategory !== null;

    
    const otherCategories = categories.filter((c) => c.id !== editingCategory?.id);
    const assignedCount = editingCategory
        ? transactions.filter((t) => t.categoryId === editingCategory.id).length
        : 0;

    /**
     * Fills the form with a category (edit mode) or resets it to empty defaults (create mode).
     * @param category - Category to edit, or `null` for create mode
     */
    function fillForm(category: Category | null) {
        setEditingCategory(category);
        setName(category?.name ?? '');
        setIcon(category?.icon ?? DEFAULT_ICON);
        setColor(category?.color ?? DEFAULT_COLOR);
        setBudget(category?.monthlyBudget !== undefined ? String(category.monthlyBudget) : '');
        setTargetCategoryId(categories.find((c) => c.id !== category?.id)?.id ?? '');
        setErrors({});
    }

    /**
     * Removes the error message of a single form field.
     * @param field - Name of the field whose error should disappear
     */
    const clearError = (field: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    /**
     * Builds the category from the form state, validates it and passes it to `onCreate` or `onUpdate`.
     * @param e - The form submit event
     */
    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();

        const category: NewCategory = {
            name: name.trim(),
            icon,
            color,
            monthlyBudget: parseBudgetInput(budget),
        };

        const validationErrors = checkCategory(category, categories, editingCategory?.id);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (editingCategory) {
            onUpdate({ ...editingCategory, ...category });
        } else {
            onCreate(category);
        }
        fillForm(null);
    };

    /** Asks for confirmation and deletes the edited category (moving its transactions if needed). */
    const handleDelete = () => {
        if (!editingCategory) return;

        const target = otherCategories.find((c) => c.id === targetCategoryId);
        if (assignedCount > 0 && !target) {
            setErrors({ target: 'Bitte eine Zielkategorie für die Buchungen auswählen' });
            return;
        }

        const question = assignedCount > 0 && target
            ? `Kategorie „${editingCategory.name}“ löschen? ${assignedCount} ${assignedCount === 1 ? 'Buchung wird' : 'Buchungen werden'} nach „${target.name}“ verschoben.`
            : `Kategorie „${editingCategory.name}“ löschen?`;

       
        if (!window.confirm(question)) return;

        onDelete(editingCategory.id, assignedCount > 0 ? targetCategoryId : null);
        fillForm(null);
    };

    return (
        <section className={styles.manager}>
            <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-controls="category-manager-content"
            >
                <span>Kategorien verwalten</span>
                
                <Image
                    src={isOpen ? '/assets/icons/expand_up_light.svg' : '/assets/icons/expand_down_light.svg'}
                    alt=""
                    className={styles.chevron}
                    width={30}
                    height={30}
                />
            </button>

            {isOpen && (
                <div id="category-manager-content" className={styles.content}>
                    <ul className={styles.categoryList}>
                        {categories.map((category) => (
                            <li key={category.id} className={styles.categoryItem} style={{ borderLeftColor: category.color }}>
                                <span className={styles.categoryName}>
                                    {category.icon} {category.name}
                                </span>
                                {category.monthlyBudget !== undefined && (
                                    <span className={styles.categoryBudget}>{formatCurrency(category.monthlyBudget)} / Monat</span>
                                )}
                                <button
                                    type="button"
                                    className={styles.editButton}
                                    onClick={() => fillForm(category)}
                                    aria-label={`Kategorie ${category.name} bearbeiten`}
                                >
                                    Bearbeiten
                                </button>
                            </li>
                        ))}
                    </ul>

                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        <h3 className={styles.formTitle}>
                            {isEditMode ? `„${editingCategory.name}“ bearbeiten` : 'Neue Kategorie'}
                        </h3>

                        <div className={styles.field}>
                            <label htmlFor="category-name">Name</label>
                            <input
                                id="category-name"
                                type="text"
                                placeholder="z. B. Haustier"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={CATEGORY_NAME_MAX_LENGTH}
                            />
                            {errors.name && (
                                <ErrorMessage key={errors.name} text={errors.name} onExpire={() => clearError('name')} />
                            )}
                        </div>

                        {/* fieldset + legend groups the icon buttons under one label for screen readers */}
                        <fieldset className={styles.iconFieldset}>
                            <legend>Icon</legend>
                            <div className={styles.iconGrid}>
                                {CATEGORY_ICONS.map((option) => (
                                    <button
                                        key={option.icon}
                                        type="button"
                                        className={`${styles.iconButton} ${icon === option.icon ? styles.iconSelected : ''}`}
                                        onClick={() => setIcon(option.icon)}
                                        aria-pressed={icon === option.icon}
                                        aria-label={option.label}
                                    >
                                        {option.icon}
                                    </button>
                                ))}
                            </div>
                            {errors.icon && (
                                <ErrorMessage key={errors.icon} text={errors.icon} onExpire={() => clearError('icon')} />
                            )}
                        </fieldset>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="category-color">Farbe</label>
                                <input
                                    id="category-color"
                                    type="color"
                                    className={styles.colorInput}
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                />
                                {errors.color && (
                                    <ErrorMessage key={errors.color} text={errors.color} onExpire={() => clearError('color')} />
                                )}
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="category-budget">Monatsbudget (optional)</label>
                                <input
                                    id="category-budget"
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="z. B. 300"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                />
                                {errors.monthlyBudget && (
                                    <ErrorMessage key={errors.monthlyBudget} text={errors.monthlyBudget} onExpire={() => clearError('monthlyBudget')} />
                                )}
                            </div>
                        </div>

                    
                        {isEditMode && assignedCount > 0 && (
                            <div className={styles.field}>
                                <label htmlFor="category-target">
                                    Beim Löschen {assignedCount} {assignedCount === 1 ? 'Buchung' : 'Buchungen'} verschieben nach
                                </label>
                                {otherCategories.length > 0 ? (
                                    <select
                                        id="category-target"
                                        value={targetCategoryId}
                                        onChange={(e) => setTargetCategoryId(e.target.value)}
                                    >
                                        {otherCategories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className={styles.hint}>Lege zuerst eine weitere Kategorie an, um diese löschen zu können.</p>
                                )}
                                {errors.target && (
                                    <ErrorMessage key={errors.target} text={errors.target} onExpire={() => clearError('target')} />
                                )}
                            </div>
                        )}

                        <div className={styles.buttonRow}>
                            <button type="submit" className={styles.submitButton}>
                                {isEditMode ? 'Änderungen speichern' : 'Kategorie anlegen'}
                            </button>
                            {isEditMode && (
                                <>
                                    <button type="button" className={styles.cancelButton} onClick={() => fillForm(null)}>
                                        Abbrechen
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.deleteButton}
                                        onClick={handleDelete}
                                        disabled={assignedCount > 0 && otherCategories.length === 0}
                                    >
                                        Löschen
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}
