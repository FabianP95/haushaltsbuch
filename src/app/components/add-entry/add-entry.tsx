"use client"
import { useState, FormEvent } from 'react';
import type { NewTransaction, TransactionType, RecurrenceInterval, Category } from '../../interfaces/interfaces'; 
import { TypeToggle } from './toggle/toggle'; 
import { RecurrenceFields } from './recurrence-field/recurrence-field'; 
import { testCategories } from '@/app/data/testdata';
import styles from './add-entry.module.scss';

function onAdd(params:any) {
    console.log(params);
    
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const parsedAmount = Number(amount);
        if (!parsedAmount || parsedAmount <= 0 || !categoryId) return;

        const newTransaction: NewTransaction = {
            type,
            amount: parsedAmount,
            categoryId,
            description: description || undefined,
            date,
            isRecurring,
            recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
            recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : undefined,
        };

        onAdd(newTransaction);

        setAmount('');
        setDescription('');
        setIsRecurring(false);
        setRecurrenceEndDate('');
    };

    return (
        <form className={styles.addEntry} onSubmit={handleSubmit}>
            <TypeToggle value={type} onChange={setType} />

            <div className={styles.field}>
                <label htmlFor="amount">Betrag</label>
                <div className={styles.amountWrapper}>
                    <input
                        id="amount"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={styles.amountInput}
                        required
                    />
                    <span className={styles.currency}>€</span>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.field}>
                    <label htmlFor="category">Kategorie</label>
                    <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    >
                        {testCategories.map((c:any) => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label htmlFor="date">Datum</label>
                    <input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
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

            <button type="submit" className={styles.submitButton}>
                Buchung hinzufügen
            </button>
        </form>
    );
}