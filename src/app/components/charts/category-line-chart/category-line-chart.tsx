'use client';
import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { CategoryLineChartProps, CategoryLineLegendProps, CategoryTimelinePoint, TimelineMode } from '@/app/interfaces/interfaces';
import { formatCurrency, formatCurrencyShort } from '@/utils/currency';
import { getCategoryTimeline } from '@/utils/chart-data';
import styles from './category-line-chart.module.scss';

const CHART_HEIGHT = 320;
const Y_AXIS_WIDTH = 80;
const LINE_WIDTH = 2;
const HIGHLIGHTED_LINE_WIDTH = 4;
const DIMMED_OPACITY = 0.15;

const MODE_OPTIONS: { value: TimelineMode; label: string; emptyLabel: string }[] = [
    { value: 'Ausgabe', label: 'Ausgaben', emptyLabel: 'Ausgaben' },
    { value: 'Einnahme', label: 'Einnahmen', emptyLabel: 'Einnahmen' },
    { value: 'balance', label: 'Saldo', emptyLabel: 'Buchungen' },
];

/**
 * Legend to the right of the chart: hovering or focusing an entry highlights its line.
 * @param props - The series, the highlighted category and the highlight callback
 * @returns The legend list
 */
function CategoryLineLegend({ series, highlightedId, onHighlight }: CategoryLineLegendProps) {
    return (
        <ul className={styles.legend}>
            {series.map((entry) => (
                <li
                    key={entry.categoryId}
                    tabIndex={0}
                    className={`${styles.legendItem} ${highlightedId === entry.categoryId ? styles.highlightedItem : ''}`}
                    onMouseEnter={() => onHighlight(entry.categoryId)}
                    onMouseLeave={() => onHighlight(null)}
                    onFocus={() => onHighlight(entry.categoryId)}
                    onBlur={() => onHighlight(null)}
                >
                    <span className={styles.legendColor} style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                    <span className={styles.legendAmount}>{formatCurrency(entry.amount)}</span>
                </li>
            ))}
        </ul>
    );
}

/**
 * Line chart with the running sum of every category over the selected month (days) or year (months).
 * @param props - Transactions, categories and the selected period
 * @returns The line chart with mode switch and legend
 */
export default function CategoryLineChart({ transactions, categories, period }: CategoryLineChartProps) {

    const [mode, setMode] = useState<TimelineMode>('Ausgabe');
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const timeline = useMemo(
        () => getCategoryTimeline(transactions, categories, period, mode),
        [transactions, categories, period, mode]
    );

    const emptyLabel = MODE_OPTIONS.find((option) => option.value === mode)?.emptyLabel;

    return (
        <div className={styles.lineChartContainer}>
            <div className={styles.typeSwitcher} role="group" aria-label="Ansicht wählen">
                {MODE_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={mode === option.value}
                        className={`${styles.typeButton} ${mode === option.value ? styles.activeTypeButton : ''}`}
                        onClick={() => setMode(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {timeline.series.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Keine {emptyLabel} im gewählten Zeitraum vorhanden.</p>
                </div>
            ) : (
                <div className={styles.lineLayout}>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                            <LineChart data={timeline.points}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" />
                                <YAxis tickFormatter={formatCurrencyShort} width={Y_AXIS_WIDTH} />
                                {mode === 'balance' && <ReferenceLine y={0} stroke="currentColor" strokeOpacity={0.4} />}

                                {timeline.series.map((entry) => (
                                    <Line
                                        key={entry.categoryId}
                                        type="monotone"
                                        dataKey={(point: CategoryTimelinePoint) => point.values[entry.categoryId]}
                                        name={entry.name}
                                        stroke={entry.color}
                                        strokeWidth={highlightedId === entry.categoryId ? HIGHLIGHTED_LINE_WIDTH : LINE_WIDTH}
                                        strokeOpacity={highlightedId && highlightedId !== entry.categoryId ? DIMMED_OPACITY : 1}
                                        dot={false}
                                        activeDot={false}
                                        pointerEvents="none"
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <CategoryLineLegend
                        series={timeline.series}
                        highlightedId={highlightedId}
                        onHighlight={setHighlightedId}
                    />
                </div>
            )}
        </div>
    );
}
