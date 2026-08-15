'use client';
import SideDate from "./side-link-dates/side-date";
import SideCategory from "./side-link-categories/side-category";

export default function Sidebar() {
    return (
        <aside>
            <section>
                <h3>Jahr</h3>
                <ul>
                    <SideDate />

                </ul>
            </section>
            <section>
                <h3>Monat</h3>
                <SideDate />

            </section>
            <section>
                <h3>Kategorien</h3>
                <ul><SideCategory /></ul>
            </section>
        </aside>
    )
}