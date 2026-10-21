'use client';
import { ResponsiveContainer, Sankey, SankeyNodeProps, Tooltip } from 'recharts';
import { MoneyFlowNode, MoneyFlowSankeyProps } from '@/app/interfaces/interfaces';
import { formatCurrency } from '@/utils/currency';
import { CHART_COLORS } from '@/utils/chart-data';
import styles from './money-flow-sankey.module.scss';

const MIN_CHART_HEIGHT = 320;
const HEIGHT_PER_NODE = 28;
const LABEL_SPACE = 150;
const LABEL_GAP = 8;
const NODE_WIDTH = 12;

/**
 * Custom Sankey node: a colored bar with name and amount next to it.
 * Nodes of the first column (income) get their label on the left, all others on the right.
 * @param props - Position, size and data of the node, provided by Recharts
 * @returns The SVG elements of one node
 */
function FlowNode({ x, y, width, height, payload }: SankeyNodeProps) {
    const { color } = payload as unknown as MoneyFlowNode;
    const isFirstColumn = payload.depth === 0;
    const textX = isFirstColumn ? x - LABEL_GAP : x + width + LABEL_GAP;
    const centerY = y + height / 2;

    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={color} />
            <text x={textX} y={centerY} textAnchor={isFirstColumn ? 'end' : 'start'} className={styles.nodeName}>
                {payload.name}
                <tspan x={textX} dy="1.2em" className={styles.nodeValue}>
                    {formatCurrency(payload.value)}
                </tspan>
            </text>
        </g>
    );
}

/**
 * Sankey diagram of the money flow: income categories → budget → expense categories (+ surplus or deficit).
 * @param props - Nodes and links prepared by `getMoneyFlow`
 * @returns The responsive Sankey diagram
 */
export default function MoneyFlowSankey({ data }: MoneyFlowSankeyProps) {
    const height = Math.max(MIN_CHART_HEIGHT, data.nodes.length * HEIGHT_PER_NODE);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <Sankey
                data={data}
                node={FlowNode}
                nodeWidth={NODE_WIDTH}
                link={{ stroke: CHART_COLORS.link, strokeOpacity: 0.35 }}
                margin={{ top: 10, bottom: 30, left: LABEL_SPACE, right: LABEL_SPACE }}
            >
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </Sankey>
        </ResponsiveContainer>
    );
}
