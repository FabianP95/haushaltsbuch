'use client';
import { useMemo } from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryLegendProps, CategoryPieChartProps } from '@/app/interfaces/interfaces';
import { formatCurrency } from '@/utils/currency';
import { formatPercent } from '@/utils/chart-data';
import { UNCATEGORIZED } from '@/utils/category';
import styles from './category-pie-chart.module.scss';

const CHART_HEIGHT = 280;

/**
 * "Ohne Kategorie" is no real category, so it cannot be used as a filter.
 * @param categoryId - Id of the clicked category
 * @returns `true` if the category can be selected in the filter
 */
const isSelectable = (categoryId: string) => categoryId !== UNCATEGORIZED.id;

/**
 * Legend next to the donut: one button per category with color, name, amount and share.
 * @param props - Category totals and the select callback
 * @returns The legend list
 */
function CategoryLegend({ data, onSelectCategory }: CategoryLegendProps) {
    return (
        <ul className={styles.legend}>
            {data.map((entry) => (
                <li key={entry.categoryId}>
                    <button
                        type="button"
                        className={styles.legendButton}
                        disabled={!isSelectable(entry.categoryId)}
                        onClick={() => onSelectCategory(entry.categoryId)}
                        aria-label={`${entry.name}: ${formatCurrency(entry.amount)}, ${formatPercent(entry.ratio)} – Buchungen anzeigen`}
                    >
                        <span className={styles.legendColor} style={{ backgroundColor: entry.color }} />
                        <span className={styles.legendName}>{entry.name}</span>
                        <span className={styles.legendAmount}>{formatCurrency(entry.amount)}</span>
                        <span className={styles.legendPercent}>{formatPercent(entry.ratio)}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
}

/**
 * Donut chart of the expenses per category; clicking a segment or legend entry sets the category filter.
 * @param props - Expense totals per category, their sum and the select callback
 * @returns The donut chart with legend
 */
export default function CategoryPieChart({ data, total, onSelectCategory }: CategoryPieChartProps) {

    const pieData = useMemo(() => data.map((entry) => ({ ...entry, fill: entry.color })), [data]);

    /**
     * Sets the category filter, unless the category is the "Ohne Kategorie" fallback.
     * @param categoryId - Id of the clicked category
     */
    function handleSelect(categoryId: string) {
        if (isSelectable(categoryId)) {
            onSelectCategory(categoryId);
        }
    }

    return (
        <div className={styles.pieLayout}>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="amount"
                            nameKey="name"
                            innerRadius="60%"
                            outerRadius="90%"
                            paddingAngle={1}
                            className={styles.pie}
                            onClick={(_, index) => handleSelect(pieData[index].categoryId)}
                        />
                        <Tooltip
                            formatter={(value, name, item) => [
                                `${formatCurrency(Number(value))} (${formatPercent(item.payload.ratio)})`,
                                name,
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className={styles.centerLabel}>
                    <span className={styles.centerCaption}>Gesamt</span>
                    <span className={styles.centerValue}>{formatCurrency(total)}</span>
                </div>
            </div>

            <CategoryLegend data={data} onSelectCategory={handleSelect} />
        </div>
    );
}
