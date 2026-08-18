'use client';
import SideDate from "./side-link-dates/side-date";
import SideCategory from "./side-link-categories/side-category";
import styles from './sidebar.module.scss';

export default function Sidebar() {
    let timeVar = {
        title: 'Jahr',
        month: 'Monat',
        years: [2026, 2025, 2024],
        months: ['Mai', 'Juni', 'Juli']
    }


    return (
        <aside className={styles.aside}>

            <SideDate
                title={timeVar.title}
                year={timeVar.years}
            />

            <SideDate
                title={timeVar.month}
                month={timeVar.months}
            />

            <SideCategory timeVar={timeVar} />
        </aside>
    )
}