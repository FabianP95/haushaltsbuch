import styles from './toogle.module.scss';
import type { TransactionType } from '../../../interfaces/interfaces'; // Pfad anpassen

interface TypeToggleProps {
    value: TransactionType;
    onChange: (type: TransactionType) => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
    return (
        <div className={styles.typeToggle} role="radiogroup" aria-label="Art der Buchung">
            <button
                type="button"
                className={`${styles.typeOption} ${value === 'Ausgabe' ? styles.typeOptionActiveExpense : ''}`}
                aria-pressed={value === 'Ausgabe'}
                onClick={() => onChange('Ausgabe')}
            >
                Ausgabe
            </button>
            <button
                type="button"
                className={`${styles.typeOption} ${value === 'Einnahme' ? styles.typeOptionActiveIncome : ''}`}
                aria-pressed={value === 'Einnahme'}
                onClick={() => onChange('Einnahme')}
            >
                Einnahme
            </button>
        </div>
    );
}