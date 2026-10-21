'use client';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MonthlyBarChartProps } from '@/app/interfaces/interfaces';
import { formatCurrency, formatCurrencyShort } from '@/utils/currency';
import { CHART_COLORS } from '@/utils/chart-data';

const CHART_HEIGHT = 320;
const Y_AXIS_WIDTH = 80;

/**
 * Column chart with income and expenses per month of one year.
 * @param props - 12 monthly totals (January to December)
 * @returns The responsive bar chart
 */
export default function MonthlyBarChart({ data }: MonthlyBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={formatCurrencyShort} width={Y_AXIS_WIDTH} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="income" name="Einnahmen" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Ausgaben" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
