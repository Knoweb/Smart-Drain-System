/**
 * StatusPieChart — src/features/dashboard/StatusPieChart.tsx
 * ---------------------------------------------------------------------------
 * Renders a donut chart breaking down all drains by status.
 * The total count is overlaid in the center using CSS absolute positioning
 * (simpler and cleaner than SVG text tricks).
 */

import {
    PieChart, Pie, Cell, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'
import type { Drain, DrainStatus } from '@/types'
import { STATUS_COLOR_MAP } from '@/config/constants'
import styles from './StatusPieChart.module.css'

interface Props {
    drains: Drain[]
}

const STATUS_ORDER: DrainStatus[] = ['OPERATIONAL', 'WARNING', 'CRITICAL']
const STATUS_LABELS: Record<DrainStatus, string> = {
    OPERATIONAL: 'Operational',
    WARNING: 'Warning',
    CRITICAL: 'Critical',
}

// Custom tooltip card
function CustomTooltip({ active, payload }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; payload: { color: string } }>
}) {
    if (!active || !payload?.length) return null
    const { name, value, payload: p } = payload[0]
    return (
        <div className={styles.tooltip}>
            <span className={styles.tooltipDot} style={{ background: p.color }} />
            <span className={styles.tooltipLabel}>{name}</span>
            <span className={styles.tooltipValue}>{value}</span>
        </div>
    )
}

export function StatusPieChart({ drains }: Props) {
    const data = STATUS_ORDER.map(status => ({
        name: STATUS_LABELS[status],
        value: drains.filter(d => d.status === status).length,
        color: STATUS_COLOR_MAP[status],
    })).filter(d => d.value > 0)

    if (data.length === 0) {
        return (
            <div className={styles.empty}>
                <span>No drain data yet</span>
            </div>
        )
    }

    const total = drains.length

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>System Status</h3>

            {/* Wrapper provides stacking context for the center overlay */}
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center label overlay — positioned over the donut hole */}
                <div className={styles.centerLabel} aria-hidden="true">
                    <span className={styles.centerTotal}>{total}</span>
                    <span className={styles.centerSubtext}>TOTAL</span>
                </div>
            </div>

            {/* Numeric breakdown row */}
            <div className={styles.breakdown}>
                {STATUS_ORDER.map(status => {
                    const count = drains.filter(d => d.status === status).length
                    return (
                        <div key={status} className={styles.breakdownItem}>
                            <span className={styles.breakdownDot} style={{ background: STATUS_COLOR_MAP[status] }} />
                            <span className={styles.breakdownCount} style={{ color: STATUS_COLOR_MAP[status] }}>{count}</span>
                            <span className={styles.breakdownLabel}>{STATUS_LABELS[status]}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
