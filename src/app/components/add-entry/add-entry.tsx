"use client"
import { useState, useEffect, useRef, SubmitEvent } from 'react';
import type { NewTransaction, TransactionType, RecurrenceInterval, Category, AddEntryProps } from '../../interfaces/interfaces';
import { TypeToggle } from './toggle/toggle';
import { RecurrenceFields } from './recurrence-field/recurrence-field';
import { ErrorMessage } from './error-msg/error-msg';
import styles from './add-entry.module.scss';

type EntryErrors = Record<string, string>;

/**
 * Validates a new transaction before it is saved.
 * @param transaction - The transaction built from the form values
 * @returns An object with one error message per invalid field (empty if valid)
 */
function checkEntry(transaction: NewTransaction): EntryErrors {
    const errors: EntryErrors = {};

    if (!transaction.amount || transaction.amount <= 0) {
        errors.amount = 'Bitte einen gültigen Betrag angeben';
    }

    if (!transaction.categoryId) {
        errors.categoryId = 'Bitte eine Kategorie auswählen';
    }

    if (!transaction.date) {
        errors.date = 'Bitte ein Datum angeben';
    }

    if (
        transaction.isRecurring != false &&
        transaction.recurrenceEndDate &&
        transaction.recurrenceEndDate < transaction.date
    ) {
        errors.recurrenceEndDate = 'Bitte ein korrektes Intervall angeben';
    }
    return errors;
}


/**
 * Form for creating a new or editing an existing income/expense entry, including validation.
 * The parent remounts it via `key` when the preset changes, so the initial `useState` values are always fresh.
 * @param props - Categories, the transaction to edit (or `null`), an optional preset category and the callbacks
 * @returns The entry form
 */
export default function AddEntry({
    categories,
    editingTransaction,
    presetCategoryId,
    onAdd,
    onUpdate,
    onCancel,
}: AddEntryProps) {
    const isEditMode = editingTransaction !== null;

    
    const initialCategoryId = editingTransaction?.categoryId
        ?? (categories.some((c) => c.id === presetCategoryId) ? presetCategoryId : undefined)
        ?? categories[0]?.id
        ?? '';

    
    const [type, setType] = useState<TransactionType>(editingTransaction?.type ?? 'Ausgabe');
    const [amount, setAmount] = useState(editingTransaction ? String(editingTransaction.amount) : '');
    const [categoryId, setCategoryId] = useState(initialCategoryId);
    const [description, setDescription] = useState(editingTransaction?.description ?? '');
    const [date, setDate] = useState(() => editingTransaction?.date ?? new Date().toISOString().slice(0, 10));
    const [isRecurring, setIsRecurring] = useState(editingTransaction?.isRecurring ?? false);
    const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>(editingTransaction?.recurrenceInterval ?? 'monatlich');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState(editingTransaction?.recurrenceEndDate ?? '');
    const [errors, setErrors] = useState<EntryErrors>({});

    
    const formRef = useRef<HTMLFormElement>(null);
    const amountRef = useRef<HTMLInputElement>(null);

   
    useEffect(() => {
        if (!editingTransaction && !presetCategoryId) return;
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        amountRef.current?.focus({ preventScroll: true });
    }, [editingTransaction, presetCategoryId]);

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
     * Builds the transaction from the form state, validates it and passes it to `onAdd`.
     * @param e - The form submit event
     */
    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();

        const newTransaction: NewTransaction = {
            type,
            amount: Number(amount),
            categoryId,
            description: description || undefined,
            date,
            isRecurring,
            recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
            recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : undefined,
        };


        const validationErrors = checkEntry(newTransaction);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});

        if (editingTransaction) {
            onUpdate({ ...editingTransaction, ...newTransaction });
            return;
        }

        onAdd(newTransaction);

        setAmount('');
        setDescription('');
        setIsRecurring(false);
        setRecurrenceEndDate('');

    };

    return (
        <form ref={formRef} className={styles.addEntry} onSubmit={handleSubmit} noValidate>
           
            <h2 className={styles.formTitle}>{isEditMode ? 'Buchung bearbeiten' : 'Neue Buchung'}</h2>
            <TypeToggle value={type} onChange={setType} />

            <div className={styles.field}>
                <label htmlFor="amount">Betrag</label>
                <div className={styles.amountWrapper}>
                    <input
                        ref={amountRef}
                        id="amount"
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        placeholder="0,0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={styles.amountInput}
                    />
                    <span className={styles.currency}>€</span>
                </div>
                {errors.amount && (
                    <ErrorMessage key={errors.amount} text={errors.amount} onExpire={() => clearError('amount')} />
                )}
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label htmlFor="category">Kategorie</label>
                    <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}

                    >
                        {categories.map((c: Category) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.categoryId && (
                        <ErrorMessage key={errors.categoryId} text={errors.categoryId} onExpire={() => clearError('categoryId')} />
                    )}
                </div>

                <div className={styles.field}>
                    <label htmlFor="date">Datum</label>
                    <input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    {errors.date && (
                        <ErrorMessage key={errors.date} text={errors.date} onExpire={() => clearError('date')} />
                    )}
                </div>

            </div>


            <div className={styles.field}>
                <label htmlFor="description">Beschreibung (optional)</label>
                <input
                    id="description"
                    type="text"
                    placeholder="z. B. Wocheneinkauf"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={120}
                />
            </div>

            <RecurrenceFields
                isRecurring={isRecurring}
                interval={recurrenceInterval}
                endDate={recurrenceEndDate}
                minDate={date}
                onIsRecurringChange={setIsRecurring}
                onIntervalChange={setRecurrenceInterval}
                onEndDateChange={setRecurrenceEndDate}
            />
            {errors.recurrenceEndDate && (
                <ErrorMessage key={errors.recurrenceEndDate} text={errors.recurrenceEndDate} onExpire={() => clearError('recurrenceEndDate')} />
            )}

            <div className={styles.buttonRow}>
                <button type="submit" className={styles.submitButton}>
                    {isEditMode ? 'Änderungen speichern' : 'Buchung hinzufügen'}
                </button>
                {(isEditMode || presetCategoryId) && (
                    <button type="button" className={styles.cancelButton} onClick={onCancel}>
                        Abbrechen
                    </button>
                )}
            </div>
        </form>
    );
}