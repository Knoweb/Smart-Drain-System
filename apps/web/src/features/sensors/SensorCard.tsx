/**
 * SensorCard — src/features/sensors/SensorCard.tsx
 * ---------------------------------------------------------------------------
 * Displays live telemetry for a single drain device.
 * Calls useLatestReading(device.id) which subscribes to Firebase RTDB.
 * When Firebase pushes a new reading, only THIS card re-renders.
 */

import { useLatestReading } from '@/hooks/useLatestReading'
import { useDeviceReadings } from '@/hooks/useDeviceReadings'
import type { IoTDevice } from '@/types'
import { STATUS_COLOR_MAP } from '@/config/constants'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import styles from './SensorCard.module.css'

interface Props {
    device: IoTDevice
    drainName: string
}

// --- Realistic Water Bucket SVG ---
const WaterBucket = ({ level, color }: { level: number, color: string }) => {
    // Map level 0-100 to y position (bottom is y=110, top is y=30)
    const fillY = 110 - (level / 100) * 80;

    return (
        <svg width="80" height="120" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bucketGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4aa3df" />
                    <stop offset="50%" stopColor="#75bced" />
                    <stop offset="100%" stopColor="#2c82b8" />
                </linearGradient>
                <clipPath id="bucketClip">
                    <path d="M15,30 L85,30 L75,110 Q50,120 25,110 Z" />
                </clipPath>
            </defs>

            {/* Handle */}
            <path d="M10,35 Q50,-5 90,35" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            <circle cx="15" cy="35" r="4" fill="#334155" />
            <circle cx="85" cy="35" r="4" fill="#334155" />

            {/* Bucket Back inside */}
            <ellipse cx="50" cy="30" rx="35" ry="8" fill="#1e40af" />

            {/* Water Fill clipped to bucket shape */}
            <g clipPath="url(#bucketClip)">
                <rect x="0" y={fillY} width="100" height="130" fill={color} />
                <ellipse cx="50" cy={fillY} rx="35" ry="6" fill="#ffffff" opacity="0.3" />
            </g>

            {/* Bucket Front (Semi-transparent plastic) */}
            <path d="M15,30 L85,30 L75,110 Q50,120 25,110 Z" fill="url(#bucketGrad)" opacity="0.4" />

            {/* Top Rim */}
            <ellipse cx="50" cy="30" rx="35" ry="8" fill="none" stroke="#75bced" strokeWidth="4" />
            {/* Highlight */}
            <path d="M25,40 L20,100" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
        </svg>
    );
};

export function SensorCard({ device, drainName }: Props) {
    const { reading, loading } = useLatestReading(device.id)
    const { readings: sparkData } = useDeviceReadings(device.id, 20)
    const statusColor = STATUS_COLOR_MAP[device.status] ?? '#94a3b8'

    if (loading || !reading) {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.name}>{device.name}</h3>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{drainName}</div>
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

    // --- Data Prep ---
    const primaryLevel = device.device_type === 'mesh_bucket'
        ? (reading.mesh_level_pct ?? reading.water_level_pct ?? 0)
        : (reading.water_level_pct ?? 0)

    const levelColor = device.device_type === 'mesh_bucket'
        ? (primaryLevel >= 70 ? '#ef4444' : primaryLevel >= 50 ? '#f59e0b' : '#8b5cf6') // Purple for garbage
        : (primaryLevel >= 70 ? '#ef4444' : primaryLevel >= 50 ? '#f59e0b' : '#3b82f6') // Blue for water

    const batteryLevel = reading.battery_level_pct ?? 100
    const batteryColor = batteryLevel < 20 ? '#ef4444' : '#22c55e'

    // Sparkline: map readings to {v} objects for Recharts
    const sparkPoints = sparkData.map(r => ({
        v: device.device_type === 'mesh_bucket'
            ? (r.mesh_level_pct ?? r.water_level_pct ?? 0)
            : (r.water_level_pct ?? 0)
    }))

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.name}>{device.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{drainName}</div>
                </div>
                <span className={styles.badge} style={{ color: statusColor, borderColor: statusColor }}>
                    {device.status}
                </span>
            </div>

            <div className={styles.gaugesRow}>
                {/* Visual Water/Garbage Tank */}
                <div className={styles.visualContainer}>
                    <WaterBucket level={primaryLevel} color={levelColor} />
                    <div className={styles.visualLabel}>
                        <span className={styles.visualValue} style={{ color: levelColor }}>{primaryLevel.toFixed(0)}%</span>
                        <span className={styles.visualDesc}>{device.device_type === 'mesh_bucket' ? 'Garbage Level' : 'Water Level'}</span>
                    </div>
                </div>

                {/* Visual Battery */}
                <div className={styles.visualContainer} style={{ justifyContent: 'flex-end', height: '100%', paddingBottom: '10px' }}>
                    <div className={styles.batteryIcon}>
                        <div
                            className={styles.batteryFill}
                            style={{ width: `${batteryLevel}%`, backgroundColor: batteryColor }}
                        />
                    </div>
                    <div className={styles.visualLabel} style={{ marginTop: '12px' }}>
                        <span className={styles.visualValue} style={{ color: batteryColor }}>{batteryLevel}%</span>
                        <span className={styles.visualDesc}>Battery</span>
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

            {/* ── Sparkline ── */}
            {sparkPoints.length > 1 && (
                <div className={styles.sparklineWrapper}>
                    <span className={styles.sparklineLabel}>Water level trend</span>
                    <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={sparkPoints} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`spark-${device.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={levelColor} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={levelColor} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="v"
                                stroke={levelColor}
                                strokeWidth={2}
                                fill={`url(#spark-${device.id})`}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className={styles.footer}>
                Updated {new Date(reading.recorded_at).toLocaleTimeString()}
            </div>
        </div>
    )
}
