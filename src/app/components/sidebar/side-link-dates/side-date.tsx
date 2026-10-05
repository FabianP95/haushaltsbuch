import styles from './side-date.module.scss'
import { SideDateProps } from '@/app/interfaces/interfaces';


/**
 * List of selectable date options (e.g. years or months) with the active one highlighted.
 * @param props - Title, options, the selected value and the select callback
 * @returns The option list
 */
export default function SideDate({ title, options, selectedValue, onSelect }: SideDateProps) {

  return (

    <section className={styles.listContainer}>
      <h3 className={styles.listHeader}>{title}</h3>
      <ul className={styles.list}>
        {options.map((option) => {
          const isActive = option.value === selectedValue;
          return (
            <li className={styles.listItem} key={String(option.value)}>
              <button
                type="button"
                className={`${styles.listButton} ${isActive ? styles.active : ''}`}
               
                aria-pressed={isActive}
                onClick={() => onSelect(option.value)}
              >
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
