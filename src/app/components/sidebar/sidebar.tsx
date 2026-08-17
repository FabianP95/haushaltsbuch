'use client';
import SideDate from "./side-link-dates/side-date";
import SideCategory from "./side-link-categories/side-category";
import styles from './sidebar.module.scss';

export default function Sidebar() {
    return (
        <aside className={styles.aside}>
            <SideDate title='Jahr' />
            <SideDate title='Monat' />
            <SideCategory title='Einkaufen' />
        </aside>
    )
}