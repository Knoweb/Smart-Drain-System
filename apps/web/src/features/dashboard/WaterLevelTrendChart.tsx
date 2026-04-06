/**
 * WaterLevelTrendChart — src/features/dashboard/WaterLevelTrendChart.tsx
 * ---------------------------------------------------------------------------
 * Renders a LineChart showing the last 24h of water level readings for all
 * IoT devices, colour-coded per device.
 *
 * KEY CHART FEATURES:
 * - One coloured Line per unique device (auto-assigned from a palette)
 * - A dashed red ReferenceLine at 80% showing the ALERT threshold
 * - Gradient area under each line via LinearGradient + Area
 * - Smart X-axis: shows time as "HH:MM" format
 * - Tooltip shows all device values at that timestamp
 */

import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'
import type { HistoricalReading } from '@/hooks/useHistoricalReadings'
import { ALERT_THRESHOLD_WATER_LEVEL } from '@/config/constants'
import styles from './WaterLevelTrendChart.module.css'

// Palette for multi-device lines — rich, accessible colours
const LINE_PALETTE = [
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#ec4899', // pink
    '#10b981', // emerald
    '#f97316', // orange
    '#a855f7', // purple
]

interface Props {
    readings: HistoricalReading[]
    loading: boolean
}

// Format a UTC timestamp to local "HH:MM" for X-axis ticks
function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Build a flat pivot table: time → { [deviceName]: water_level_pct }
function pivotReadings(readings: HistoricalReading[]) {
    // Sort oldest → newest for the chart X-axis
    const sorted = [...readings].sort(
        (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )

    // Build a map: timestamp → row
    const rowMap = new Map<string, Record<string, number | string>>()
    const deviceNames = new Set<string>()

    for (const r of sorted) {
        const deviceName = r.iot_devices?.name ?? `Device ${r.device_id.slice(0, 6)}`
        deviceNames.add(deviceName)

        const timeKey = fmtTime(r.recorded_at)
        const existing = rowMap.get(timeKey) ?? { time: timeKey }
        existing[deviceName] = r.water_level_pct
        rowMap.set(timeKey, existing)
    }

    return {
        chartData: Array.from(rowMap.values()),
        deviceNames: Array.from(deviceNames),
    }
}

// Custom tooltip for multi-device display
function CustomTooltip({ active, payload, label }: {
    active?: boolean
    label?: string
    payload?: Array<{ name: string; value: number; color: string }>
}) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipTime}>{label}</p>
            {payload.map(p => (
                <div key={p.name} className={styles.tooltipRow}>
                    <span className={styles.tooltipDot} style={{ background: p.color }} />
                    <span className={styles.tooltipName}>{p.name}</span>
                    <span className={styles.tooltipVal} style={{ color: p.value >= 80 ? '#ef4444' : p.value >= 60 ? '#f59e0b' : p.color }}>
                        {p.value.toFixed(1)}%
                    </span>
                </div>
            ))}
        </div>
    )
}

export function WaterLevelTrendChart({ readings, loading }: Props) {
    const { chartData, deviceNames } = useMemo(() => pivotReadings(readings), [readings])

    if (loading) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>Water Level — Last 24 Hours</h3>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading trend data…</span>
                </div>
            </div>
        )
    }

    if (chartData.length === 0) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>Water Level — Last 24 Hours</h3>
                <div className={styles.empty}>No readings recorded in the last 24 hours.</div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Water Level — Last 24 Hours</h3>
                <div className={styles.alertBadge}>
                    <span className={styles.alertDash} />
                    Alert threshold: {ALERT_THRESHOLD_WATER_LEVEL}%
                </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    {/* SVG gradient definitions — forwarded by Recharts to the underlying SVG */}
                    <defs>
                        {deviceNames.map((name, i) => {
                            const color = LINE_PALETTE[i % LINE_PALETTE.length]
                            return (
                                <linearGradient key={name} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            )
                        })}
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--surface-border)"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="time"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--surface-border)' }}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />

                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                        width={40}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Alert threshold line at 80% — label shown in the header badge */}
                    <ReferenceLine
                        y={ALERT_THRESHOLD_WATER_LEVEL}
                        stroke="#ef4444"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                    />

                    {/* Soft gradient fill areas underneath lines */}
                    {deviceNames.map((name, i) => (
                        <Area
                            key={`area-${name}`}
                            type="monotone"
                            dataKey={name}
                            fill={`url(#gradient-${i})`}
                            stroke="none"
                            isAnimationActive={false}
                        />
                    ))}

                    {/* Actual coloured lines per device */}
                    {deviceNames.map((name, i) => {
                        const color = LINE_PALETTE[i % LINE_PALETTE.length]
                        return (
                            <Line
                                key={name}
                                type="monotone"
                                dataKey={name}
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                                animationDuration={600}
                                connectNulls
                            />
                        )
                    })}

                    <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{value}</span>
                        )}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
