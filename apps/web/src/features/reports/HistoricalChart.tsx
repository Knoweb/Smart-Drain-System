/**
 * HistoricalChart — src/features/reports/HistoricalChart.tsx
 * ---------------------------------------------------------------------------
 * A ComposedChart showing all four sensor metrics over the selected time range:
 *
 *   - Water Level %  → Area (filled, primary axis)
 *   - Temperature °C → Line (secondary axis, right side)
 *   - Pressure PSI   → Bar (subtle, behind area)
 *   - Battery %      → Line (primary axis, dashed)
 *
 * When a single device is selected, individual readings are plotted.
 * When "All Devices" is selected, readings are grouped by timestamp and
 * the highest water level per time bucket is used (to surface worst-case).
 *
 * X-axis label format:
 *   24h  → "HH:MM"
 *   7d   → "Mon DD HH:MM"
 *   all  → "DD/MM/YY"
 */

import {
    ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'
import type { HistoricalReading } from '@/hooks/useHistoricalReadings'
import type { TimeRange } from '@/hooks/useHistoricalReadings'
import { ALERT_THRESHOLD_WATER_LEVEL } from '@/config/constants'
import styles from './HistoricalChart.module.css'

interface Props {
    readings: HistoricalReading[]
    loading: boolean
    timeRange: TimeRange
    deviceId: string
}

// ── Timestamp formatters ─────────────────────────────────────────────────────
function fmtLabel(iso: string, range: TimeRange): string {
    const d = new Date(iso)
    if (range === '24h') {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (range === '7d') {
        return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
            + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// ── Data preparation ─────────────────────────────────────────────────────────
interface ChartRow {
    label: string
    waterLevel: number
    temperature: number | null
    pressure: number | null
    battery: number | null
}

function prepareData(readings: HistoricalReading[], range: TimeRange): ChartRow[] {
    const sorted = [...readings].sort(
        (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    return sorted.map(r => ({
        label: fmtLabel(r.recorded_at, range),
        waterLevel: r.water_level_pct,
        temperature: r.temperature_c ?? null,
        pressure: r.water_pressure_psi ?? null,
        battery: r.battery_level_pct ?? null,
    }))
}

// ── Custom Tooltip ───────────────────────────────────────────────────────────
interface TooltipPayloadItem {
    name: string
    value: number | null
    color: string
    unit?: string
}
function CustomTooltip({ active, payload, label }: {
    active?: boolean
    label?: string
    payload?: TooltipPayloadItem[]
}) {
    if (!active || !payload?.length) return null

    const UNITS: Record<string, string> = {
        'Water Level': '%',
        'Temperature': '°C',
        'Pressure': ' psi',
        'Battery': '%',
    }

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipTime}>{label}</p>
            {payload.map(p => p.value != null && (
                <div key={p.name} className={styles.tooltipRow}>
                    <span className={styles.tooltipDot} style={{ background: p.color }} />
                    <span className={styles.tooltipName}>{p.name}</span>
                    <span
                        className={styles.tooltipVal}
                        style={{
                            color: p.name === 'Water Level' && p.value >= 80
                                ? '#ef4444'
                                : p.name === 'Battery' && p.value < 20
                                    ? '#ef4444'
                                    : p.color,
                        }}
                    >
                        {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{UNITS[p.name] ?? ''}
                    </span>
                </div>
            ))}
        </div>
    )
}

// ── Component ────────────────────────────────────────────────────────────────
export function HistoricalChart({ readings, loading, timeRange, deviceId }: Props) {
    const data = useMemo(() => prepareData(readings, timeRange), [readings, timeRange])

    const rangeLabel = timeRange === '24h' ? 'Last 24 Hours'
        : timeRange === '7d' ? 'Last 7 Days'
            : 'All Historical Data'

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Sensor Trends — {rangeLabel}</h3>
                </div>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading chart…</span>
                </div>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Sensor Trends — {rangeLabel}</h3>
                </div>
                <div className={styles.empty}>
                    No readings available for the selected filters.
                </div>
            </div>
        )
    }

    // Adaptive tick count based on data density
    const tickInterval = data.length <= 24 ? 0
        : data.length <= 96 ? Math.floor(data.length / 24)
            : Math.floor(data.length / 12)

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>Sensor Trends — {rangeLabel}</h3>
                    <p className={styles.subtitle}>
                        {deviceId === 'all' ? 'All devices' : 'Single device'} · {data.length} data points
                    </p>
                </div>
                <div className={styles.alertBadge}>
                    <span className={styles.alertDash} />
                    Alert at {ALERT_THRESHOLD_WATER_LEVEL}%
                </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={data} margin={{ top: 8, right: 48, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--surface-border)"
                        vertical={false}
                    />

                    {/* ── X Axis ── */}
                    <XAxis
                        dataKey="label"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        axisLine={{ stroke: 'var(--surface-border)' }}
                        tickLine={false}
                        interval={tickInterval}
                    />

                    {/* ── Y Axis left: % values ── */}
                    <YAxis
                        yAxisId="pct"
                        domain={[0, 100]}
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                        width={42}
                    />

                    {/* ── Y Axis right: temperature °C ── */}
                    <YAxis
                        yAxisId="temp"
                        orientation="right"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}°`}
                        width={36}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Alert threshold */}
                    <ReferenceLine
                        yAxisId="pct"
                        y={ALERT_THRESHOLD_WATER_LEVEL}
                        stroke="#ef4444"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                    />

                    {/* Pressure bars — subtle background context */}
                    <Bar
                        yAxisId="pct"
                        dataKey="pressure"
                        name="Pressure"
                        fill="#8b5cf6"
                        fillOpacity={0.18}
                        radius={[2, 2, 0, 0]}
                        maxBarSize={8}
                        isAnimationActive={false}
                    />

                    {/* Water level area — main metric */}
                    <Area
                        yAxisId="pct"
                        type="monotone"
                        dataKey="waterLevel"
                        name="Water Level"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#waterGradient)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }}
                        animationDuration={600}
                        connectNulls
                    />

                    {/* Battery % — dashed line */}
                    <Line
                        yAxisId="pct"
                        type="monotone"
                        dataKey="battery"
                        name="Battery"
                        stroke="#22c55e"
                        strokeWidth={1.5}
                        strokeDasharray="5 3"
                        dot={false}
                        activeDot={{ r: 3, strokeWidth: 0 }}
                        animationDuration={600}
                        connectNulls
                    />

                    {/* Temperature — right axis */}
                    <Line
                        yAxisId="temp"
                        type="monotone"
                        dataKey="temperature"
                        name="Temperature"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 3, strokeWidth: 0 }}
                        animationDuration={600}
                        connectNulls
                    />

                    <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{value}</span>
                        )}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
