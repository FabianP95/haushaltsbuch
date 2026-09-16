"use client"
import { useState, SubmitEvent } from 'react';
import type { NewTransaction, TransactionType, RecurrenceInterval, Category } from '../../interfaces/interfaces';
import { TypeToggle } from './toggle/toggle';
import { RecurrenceFields } from './recurrence-field/recurrence-field';
import { ErrorMessage } from './error-msg/error-msg';
import { testCategories } from '@/app/data/testdata';
import styles from './add-entry.module.scss';

type EntryErrors = Record<string, string>;


function onAdd(params: any) {
    console.log(params);

}

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

export default function AddEntry() {
    const [type, setType] = useState<TransactionType>('Ausgabe');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState(testCategories[0]?.id ?? '');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('monatlich');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    const [errors, setErrors] = useState<EntryErrors>({});

    const clearError = (field: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

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
        onAdd(newTransaction);

        setAmount('');
        setDescription('');
        setIsRecurring(false);
        setRecurrenceEndDate('');

    };

    return (
        <form className={styles.addEntry} onSubmit={handleSubmit} noValidate>
            <TypeToggle value={type} onChange={setType} />

            <div className={styles.field}>
                <label htmlFor="amount">Betrag</label>
                <div className={styles.amountWrapper}>
                    <input
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
                        {testCategories.map((c: any) => (
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

            <button type="submit" className={styles.submitButton}>
                Buchung hinzufügen
            </button>
        </form>
    );
}