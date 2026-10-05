'use client';
import SideDate from "./side-link-dates/side-date";
import styles from './sidebar.module.scss';
import { SidebarProps, SideDateOption } from '@/app/interfaces/interfaces';
import { getMonthOptions } from '@/utils/date-filter';


const monthOptions: SideDateOption[] = [
   
    { value: null, label: 'Ganzes Jahr' },
    ...getMonthOptions()
];

/**
 * Sidebar for choosing the year and month of the displayed period.
 * @param props - Available years, the selected period and the select callback
 * @returns The sidebar
 */
export default function Sidebar({ years, selectedPeriod, onSelectPeriod }: SidebarProps) {

  
    const yearOptions: SideDateOption[] = years.map((year) => ({ value: year, label: String(year) }));

    return (
        <aside className={styles.aside}>

            <SideDate
                title="Jahr"
                options={yearOptions}
                selectedValue={selectedPeriod.year}
                onSelect={(year) => year !== null && onSelectPeriod({ ...selectedPeriod, year })}
            />

            <SideDate
                title="Monat"
                options={monthOptions}
                selectedValue={selectedPeriod.month}
                onSelect={(month) => onSelectPeriod({ ...selectedPeriod, month })}
            />

        </aside>
    )
}
