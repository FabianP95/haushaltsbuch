import { useState, SubmitEvent } from 'react';
import Image from 'next/image';
import { CategoryGroupCardProps } from '@/app/interfaces/interfaces';
import { TransactionItem } from './transaction-item/transaction-item';
import { formatCurrency } from '@/utils/currency';
import { checkCategory, parseBudgetInput } from '@/utils/category';
import { ErrorMessage } from '@/app/components/add-entry/error-msg/error-msg';
import styles from './category-group.module.scss';


const BUDGET_STATUS_CLASS = {
    ok: styles.budgetOk,
    warning: styles.budgetWarning,
    exceeded: styles.budgetExceeded,
};

/**
 * Collapsible card showing a category with its net sum and its transactions.
 * @param props - The category group and a map to look up categories by id
 * @returns The category card
 */
export function CategoryGroupCard({
    group,
    categoryMap,
    onEditTransaction,
    onDeleteTransaction,
    onAddToCategory,
    onUpdateCategory,
}: CategoryGroupCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');
    const [budgetError, setBudgetError] = useState('');

   
    const canSetBudget = categoryMap.has(group.category.id);

    
    const openBudgetForm = () => {
        setBudgetInput(group.category.monthlyBudget !== undefined ? String(group.category.monthlyBudget) : '');
        setBudgetError('');
        setIsBudgetFormOpen(true);
    };

    /**
     * Validates the typed budget and saves it on the category (empty field removes the budget).
     * @param e - The form submit event
     */
    const handleBudgetSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        const updatedCategory = { ...group.category, monthlyBudget: parseBudgetInput(budgetInput) };

        const errors = checkCategory(updatedCategory, [...categoryMap.values()], group.category.id);
        if (errors.monthlyBudget) {
            setBudgetError(errors.monthlyBudget);
            return;
        }

        onUpdateCategory(updatedCategory);
        setIsBudgetFormOpen(false);
    };

    const netAmount = group.transactions.reduce((sum, tx) => {
        return tx.type === 'Einnahme' ? sum + tx.amount : sum - tx.amount;
    }, 0);

    const isPositiv = netAmount >= 0;
    const budget = group.budgetUsage;

    return (
        <section className={styles.groupCard}>
            <div
                className={styles.groupHeader}
                style={{ borderLeftColor: group.category.color }}


            >
                <div className={styles.groupInfo}>
                    <div className={styles.groupTitleInfo}>
                        <span className={styles.groupIcon} style={{ backgroundColor: `${group.category.color}20` }}>
                            {group.category.icon}
                        </span>
                        <div>
                            <h3 className={styles.groupName}>{group.category.name}</h3>
                            <span className={styles.groupCount}>
                                {group.transactions.length} {group.transactions.length === 1 ? 'Eintrag' : 'Einträge'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.groupTotal}>
                        <span className={styles.groupTotalLabel}>Summe:</span>
                        <span className={isPositiv ? styles.totalAmountPositiv : styles.totalAmountNegativ}>
                            {formatCurrency(netAmount)}
                        </span>
                    </div>
                    {canSetBudget && (
                        <button
                            type="button"
                            className={styles.budgetBtn}
                            onClick={openBudgetForm}
                            aria-expanded={isBudgetFormOpen}
                            aria-label={`Budget für ${group.category.name} festlegen`}
                        >
                            Budget
                            <Image className={styles.budgetBtnImg} src="/assets/icons/add.svg" alt="" width={20} height={20} />
                        </button>
                    )}
                </div>
                <div>
                    <button className={styles.addBtn} onClick={() => onAddToCategory(group.category.id)}>
                        <Image className={styles.btnImg} src="/assets/icons/add.svg" alt={`Neue Buchung in ${group.category.name} anlegen`} width={30} height={30} />
                    </button>
                    <button className={styles.addBtn} onClick={() => setIsOpen((prev) => !prev)} aria-expanded={isOpen}>
                        <Image
                            src={isOpen ? '/assets/icons/expand_up.svg' : '/assets/icons/expand_down_dark.svg'}
                            alt={isOpen ? 'Zuklappen' : 'Aufklappen'}
                            className={styles.chevron}
                            width={30}
                            height={30}
                        />
                    </button>

                </div>

            </div>

           
            {isBudgetFormOpen && (
                <form className={styles.budgetForm} onSubmit={handleBudgetSubmit} noValidate>
                    <label htmlFor={`budget-${group.category.id}`}>Monatsbudget</label>
                    <input
                        id={`budget-${group.category.id}`}
                        type="text"
                        inputMode="decimal"
                        placeholder="z. B. 300 (leer = kein Budget)"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className={styles.budgetSaveBtn}>Speichern</button>
                    <button type="button" className={styles.budgetCancelBtn} onClick={() => setIsBudgetFormOpen(false)}>
                        Abbrechen
                    </button>
                    {budgetError && (
                        <ErrorMessage key={budgetError} text={budgetError} onExpire={() => setBudgetError('')} />
                    )}
                </form>
            )}

           
            {budget && (
                <div className={styles.budget}>
                    <div className={styles.budgetText}>
                        <span>Budget</span>
                        <span>
                            {formatCurrency(budget.spent)} von {formatCurrency(budget.limit)} ({budget.percent} %)
                            {budget.status === 'exceeded' && budget.spent > budget.limit && (
                                <strong className={styles.budgetOverText}> · {formatCurrency(budget.spent - budget.limit)} überschritten</strong>
                            )}
                        </span>
                    </div>
                  
                    <div
                        className={styles.budgetTrack}
                        role="progressbar"
                        aria-label={`Budget ${group.category.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(budget.percent, 100)}
                        aria-valuetext={`${budget.percent} % verbraucht`}
                    >
                        <div
                            className={`${styles.budgetFill} ${BUDGET_STATUS_CLASS[budget.status]}`}
                            style={{ width: `${Math.min(budget.percent, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            <div className={`${styles.transactionListWrapper} ${isOpen ? styles.open : ''}`}>
                <div className={styles.transactionList}>
                    {group.transactions.length === 0 ? (
                        <div className={styles.noEntries}>Keine Ausgaben vorhanden</div>
                    ) : (
                        group.transactions.map((tx) => (
                            <TransactionItem
                                key={tx.id}
                                transaction={tx}
                                categoryMap={categoryMap}
                                onEdit={onEditTransaction}
                                onDelete={onDeleteTransaction}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}