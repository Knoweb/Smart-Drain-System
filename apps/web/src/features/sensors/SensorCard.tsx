/**
 * SensorCard — src/features/sensors/SensorCard.tsx
 * ---------------------------------------------------------------------------
 * This component displays the live telemetry for a single drain.
 * It uses Recharts to render circular gauges for Water Level and Battery.
 *
 * HOW IT WORKS:
 * Parant (<SensorsPage>) gives it a `drain.id`.
 * This component calls `useLatestReading(drain.id)`.
 * When Supabase Realtime pushes a new reading, only THIS card re-renders,
 * without affecting the rest of the page.
 */

import { useLatestReading } from '@/hooks/useLatestReading'
import type { IoTDevice } from '@/types'
import { STATUS_COLOR_MAP } from '@/config/constants'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import styles from './SensorCard.module.css'

interface Props {
    device: IoTDevice
    drainName: string
}

export function SensorCard({ device, drainName }: Props) {
    const { reading, loading } = useLatestReading(device.id)
    const statusColor = STATUS_COLOR_MAP[device.status] ?? '#94a3b8'

    if (loading || !reading) {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.name}>{device.name}</h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{drainName}</div>
                    </div>
                    <span className={styles.badge} style={{ color: statusColor, borderColor: statusColor }}>
                        {device.status}
                    </span>
                </div>
                <div className={styles.loading}>
                    {loading ? 'Connecting to sensor…' : 'No readings available yet.'}
                </div>
            </div>
        )
    }

    // --- Gauge Data Prep ---
    // RadialBarChart wants an array of objects. We map 0-100 values to the angle axis.

    const waterColor = reading.water_level_pct >= 80 ? '#ef4444' // Red if critical
        : reading.water_level_pct >= 60 ? '#f59e0b' // Amber if warning
            : '#3b82f6'                                 // Blue if normal

    const batteryColor = (reading.battery_level_pct ?? 100) < 20 ? '#ef4444' : '#22c55e'

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.name}>{device.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{drainName}</div>
                </div>
                <span className={styles.badge} style={{ color: statusColor, borderColor: statusColor }}>
                    {device.status}
                </span>
            </div>

            <div className={styles.gaugesRow}>
                {/* Water Level Gauge */}
                <div className={styles.gaugeContainer}>
                    <ResponsiveContainer width={120} height={120}>
                        <RadialBarChart
                            cx="50%" cy="50%"
                            innerRadius="70%" outerRadius="100%"
                            barSize={10}
                            data={[{ value: reading.water_level_pct, fill: waterColor }]}
                            startAngle={210} endAngle={-30}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                background={{ fill: 'var(--surface-border)' }}
                                dataKey="value"
                                cornerRadius={10}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className={styles.gaugeLabel}>
                        <span className={styles.gaugeValue}>{reading.water_level_pct.toFixed(0)}%</span>
                        <span className={styles.gaugeDesc}>Water Level</span>
                    </div>
                </div>

                {/* Battery Gauge */}
                <div className={styles.gaugeContainer}>
                    <ResponsiveContainer width={100} height={100}>
                        <RadialBarChart
                            cx="50%" cy="50%"
                            innerRadius="70%" outerRadius="100%"
                            barSize={8}
                            data={[{ value: reading.battery_level_pct ?? 0, fill: batteryColor }]}
                            startAngle={210} endAngle={-30}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                background={{ fill: 'var(--surface-border)' }}
                                dataKey="value"
                                cornerRadius={10}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className={styles.gaugeLabel}>
                        <span className={styles.gaugeValue}>{reading.battery_level_pct ?? '--'}%</span>
                        <span className={styles.gaugeDesc}>Battery</span>
                    </div>
                </div>
            </div>

            <div className={styles.metricsRow}>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Pressure</span>
                    <span className={styles.metricValue}>
                        {reading.water_pressure_psi != null ? `${reading.water_pressure_psi.toFixed(1)} psi` : 'N/A'}
                    </span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Temperature</span>
                    <span className={styles.metricValue}>
                        {reading.temperature_c != null ? `${reading.temperature_c.toFixed(1)} °C` : 'N/A'}
                    </span>
                </div>
            </div>

            <div className={styles.footer}>
                Updated {new Date(reading.recorded_at).toLocaleTimeString()}
            </div>
        </div>
    )
}
