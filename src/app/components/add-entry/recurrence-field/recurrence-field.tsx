import styles from './recurrence-field.module.scss';
import type { RecurrenceInterval } from '../../../interfaces/interfaces'; 

const recurrenceIntervals: RecurrenceInterval[] = ['monatlich', 'jeden zweiten Monat', 'quartalsweise', 'jährlich'];

interface RecurrenceFieldsProps {
    isRecurring: boolean;
    interval: RecurrenceInterval;
    endDate: string;
    minDate: string;
    onIsRecurringChange: (value: boolean) => void;
    onIntervalChange: (value: RecurrenceInterval) => void;
    onEndDateChange: (value: string) => void;
}

export function RecurrenceFields({
    isRecurring,
    interval,
    endDate,
    minDate,
    onIsRecurringChange,
    onIntervalChange,
    onEndDateChange,
}: RecurrenceFieldsProps) {
    return (
        <div className={styles.recurringSection}>
            <label className={styles.checkboxRow}>
                <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => onIsRecurringChange(e.target.checked)}
                />
                Wiederkehrende Buchung
            </label>

            {isRecurring && (
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label htmlFor="interval">Intervall</label>
                        <select
                            id="interval"
                            value={interval}
                            onChange={(e) => onIntervalChange(e.target.value as RecurrenceInterval)}
                        >
                            {recurrenceIntervals.map((i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="recurrenceEnd">Endet am (optional)</label>
                        <input
                            id="recurrenceEnd"
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            min={minDate}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}