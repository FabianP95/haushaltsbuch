'use client';
import { useMemo, useState } from 'react';
import { ChartCardProps, ChartSwitcherProps, ChartType, ChartTypeOption, ChartsProps } from '@/app/interfaces/interfaces';
import { filterTransactions, getPeriodLabel } from '@/utils/date-filter';
import { getCategoryTotals, getMoneyFlow, getMonthlyTotals } from '@/utils/chart-data';
import MonthlyBarChart from './monthly-bar-chart/monthly-bar-chart';
import CategoryPieChart from './category-pie-chart/category-pie-chart';
import MoneyFlowSankey from './money-flow-sankey/money-flow-sankey';
import CategoryLineChart from './category-line-chart/category-line-chart';
import styles from './charts.module.scss';

const CHART_TYPE_OPTIONS: ChartTypeOption[] = [
    { value: 'bar', label: 'Säulendiagramm' },
    { value: 'pie', label: 'Kreisdiagramm' },
    { value: 'sankey', label: 'Sankey-Diagramm' },
    { value: 'line', label: 'Liniendiagramm' },
];

/**
 * Button group to choose which chart is shown.
 * @param props - The active chart and the select callback
 * @returns The chart switcher
 */
function ChartSwitcher({ activeChart, onSelectChart }: ChartSwitcherProps) {
    return (
        <div className={styles.chartSwitcher} role="group" aria-label="Diagramm wählen">
            {CHART_TYPE_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={activeChart === option.value}
                    className={`${styles.chartButton} ${activeChart === option.value ? styles.activeChartButton : ''}`}
                    onClick={() => onSelectChart(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

/**
 * Card with a title that shows either the chart or an empty-state message.
 * @param props - Title, empty flag, empty message and the chart as children
 * @returns The chart card
 */
function ChartCard({ title, isEmpty, emptyMessage, children }: ChartCardProps) {
    return (
        <section className={styles.chartCard}>
            <h2 className={styles.chartTitle}>{title}</h2>
            {isEmpty ? (
                <div className={styles.emptyState}>
                    <p>{emptyMessage}</p>
                </div>
            ) : children}
        </section>
    );
}

/**
 * Chart area: shows either the bar, pie, Sankey or line chart for the selected period and category.
 * @param props - Categories, all transactions, the selected filters and the category select callback
 * @returns The charts view
 */
export default function Charts({
    categories,
    transactions,
    selectedPeriod,
    selectedCategoryId,
    onSelectCategory,
}: ChartsProps) {

    const [activeChart, setActiveChart] = useState<ChartType>('bar');

    const yearTransactions = useMemo(
        () => filterTransactions(transactions, { year: selectedPeriod.year, month: null }, selectedCategoryId),
        [transactions, selectedPeriod.year, selectedCategoryId]
    );

    const periodTransactions = useMemo(
        () => filterTransactions(transactions, selectedPeriod, selectedCategoryId),
        [transactions, selectedPeriod, selectedCategoryId]
    );

    const allCategoryTransactions = useMemo(
        () => filterTransactions(transactions, selectedPeriod, 'all'),
        [transactions, selectedPeriod]
    );

    const monthlyTotals = useMemo(
        () => getMonthlyTotals(yearTransactions, selectedPeriod.year),
        [yearTransactions, selectedPeriod.year]
    );

    const expenseTotals = useMemo(
        () => getCategoryTotals(periodTransactions, categories, 'Ausgabe'),
        [periodTransactions, categories]
    );

    const expenseSum = expenseTotals.reduce((sum, t) => sum + t.amount, 0);

    const moneyFlow = useMemo(
        () => getMoneyFlow(periodTransactions, categories),
        [periodTransactions, categories]
    );

    const periodLabel = getPeriodLabel(selectedPeriod);

    return (
        <div className={styles.chartsContainer}>
            <ChartSwitcher activeChart={activeChart} onSelectChart={setActiveChart} />

            {activeChart === 'bar' && (
                <ChartCard
                    title={`Einnahmen & Ausgaben ${selectedPeriod.year}`}
                    isEmpty={yearTransactions.length === 0}
                    emptyMessage={`Keine Buchungen im Jahr ${selectedPeriod.year} vorhanden.`}
                >
                    <MonthlyBarChart data={monthlyTotals} />
                </ChartCard>
            )}

            {activeChart === 'pie' && (
                <ChartCard
                    title={`Ausgaben nach Kategorie – ${periodLabel}`}
                    isEmpty={expenseTotals.length === 0}
                    emptyMessage="Keine Ausgaben im gewählten Zeitraum vorhanden."
                >
                    <CategoryPieChart data={expenseTotals} total={expenseSum} onSelectCategory={onSelectCategory} />
                </ChartCard>
            )}

            {activeChart === 'sankey' && (
                <ChartCard
                    title={`Geldfluss – ${periodLabel}`}
                    isEmpty={moneyFlow.nodes.length === 0}
                    emptyMessage="Keine Buchungen im gewählten Zeitraum vorhanden."
                >
                    <MoneyFlowSankey data={moneyFlow} />
                </ChartCard>
            )}

            {activeChart === 'line' && (
                <ChartCard
                    title={`Verlauf nach Kategorie – ${periodLabel}`}
                    isEmpty={allCategoryTransactions.length === 0}
                    emptyMessage="Keine Buchungen im gewählten Zeitraum vorhanden."
                >
                    <CategoryLineChart
                        transactions={allCategoryTransactions}
                        categories={categories}
                        period={selectedPeriod} />
                </ChartCard>
            )}
        </div>
    );
}
