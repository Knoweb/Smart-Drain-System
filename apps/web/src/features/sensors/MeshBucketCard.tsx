/**
 * MeshBucketCard — src/features/sensors/MeshBucketCard.tsx
 * ---------------------------------------------------------------------------
 * Displays live telemetry for a mesh bucket sensor (garbage level).
 */

import { useLatestReading } from '@/hooks/useLatestReading'
import { useDeviceReadings } from '@/hooks/useDeviceReadings'
import type { MeshBucket } from '@/types'
import { STATUS_COLOR_MAP } from '@/config/constants'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import styles from './SensorCard.module.css'

interface Props {
    bucket: MeshBucket
    drainName: string
}

// --- Realistic Mesh Bucket SVG ---
const MeshBucket = ({ level, color }: { level: number, color: string }) => {
    // Map level 0-100 to y position (bottom is y=110, top is y=25)
    const fillY = 110 - (level / 100) * 85;
    
    return (
        <svg width="80" height="120" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="meshPattern" width="6" height="6" patternUnits="userSpaceOnUse">
                    <path d="M 6 0 L 0 6 M 0 0 L 6 6" fill="none" stroke="#64748b" strokeWidth="1" opacity="0.8"/>
                </pattern>
                <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8"/>
                    <stop offset="20%" stopColor="#cbd5e1"/>
                    <stop offset="50%" stopColor="#f1f5f9"/>
                    <stop offset="80%" stopColor="#cbd5e1"/>
                    <stop offset="100%" stopColor="#64748b"/>
                </linearGradient>
                <clipPath id="meshClip">
                    <path d="M15,25 L85,25 L85,110 Q50,120 15,110 Z" />
                </clipPath>
            </defs>
            
            {/* Handle */}
            <path d="M10,35 Q50,-5 90,35" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="15" cy="30" r="3" fill="#94a3b8"/>
            <circle cx="85" cy="30" r="3" fill="#94a3b8"/>
            
            {/* Bucket Back inside Rim */}
            <ellipse cx="50" cy="25" rx="35" ry="6" fill="#e2e8f0"/>
            
            {/* Garbage Fill */}
            <g clipPath="url(#meshClip)">
                <rect x="0" y={fillY} width="100" height="130" fill={color} opacity="0.85"/>
                {/* Trash texture overlay */}
                <path d={`M10,${fillY+5} Q30,${fillY-10} 60,${fillY} T90,${fillY-5} L90,130 L10,130 Z`} fill="#0f172a" opacity="0.15"/>
            </g>
            
            {/* Mesh Body */}
            <path d="M15,25 L85,25 L85,110 Q50,120 15,110 Z" fill="url(#meshPattern)"/>
            
            {/* Vertical Supports */}
            <line x1="15" y1="25" x2="15" y2="110" stroke="url(#metalGrad)" strokeWidth="3"/>
            <line x1="85" y1="25" x2="85" y2="110" stroke="url(#metalGrad)" strokeWidth="3"/>
            <line x1="38" y1="25" x2="38" y2="112" stroke="url(#metalGrad)" strokeWidth="2"/>
            <line x1="62" y1="25" x2="62" y2="112" stroke="url(#metalGrad)" strokeWidth="2"/>
            
            {/* Bottom Rim */}
            <ellipse cx="50" cy="110" rx="35" ry="6" fill="none" stroke="url(#metalGrad)" strokeWidth="5"/>
            {/* Top Rim */}
            <ellipse cx="50" cy="25" rx="35" ry="6" fill="none" stroke="url(#metalGrad)" strokeWidth="5"/>
        </svg>
    );
};


export function MeshBucketCard({ bucket, drainName }: Props) {
    // We pass bucket.id (which is sub_id) to get the latest reading
    const { reading, loading } = useLatestReading(bucket.id)
    const { readings: sparkData } = useDeviceReadings(bucket.id, 20)
    const statusColor = STATUS_COLOR_MAP[bucket.status] ?? '#94a3b8'

    if (loading || !reading) {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.name}>{bucket.name}</h3>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{drainName} (Mesh Bucket)</div>
                    </div>
                    <span className={styles.badge} style={{ color: statusColor, borderColor: statusColor }}>
                        {bucket.status}
                    </span>
                </div>
                <div className={styles.loading}>
                    {loading ? 'Connecting to mesh sensor…' : 'No readings available yet.'}
                </div>
            </div>
        )
    }

    const meshLevel = reading.mesh_level_pct ?? 0

    // --- Data Prep ---
    const garbageColor = meshLevel >= 70 ? '#ef4444'
        : meshLevel >= 50 ? '#f59e0b'
            : '#8b5cf6' // Purple for garbage level

    const batteryLevel = reading.battery_level_pct ?? 100
    const batteryColor = batteryLevel < 20 ? '#ef4444' : '#22c55e'

    // Sparkline: map readings to {v} objects for Recharts
    const sparkPoints = sparkData.map(r => ({ v: r.mesh_level_pct ?? 0 }))

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.name}>{bucket.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{drainName} (Mesh Bucket)</div>
                </div>
                <span className={styles.badge} style={{ color: statusColor, borderColor: statusColor }}>
                    {bucket.status}
                </span>
            </div>

            <div className={styles.gaugesRow}>
                {/* Visual Garbage Bin */}
                <div className={styles.visualContainer}>
                    <MeshBucket level={meshLevel} color={garbageColor} />
                    <div className={styles.visualLabel}>
                        <span className={styles.visualValue} style={{ color: garbageColor }}>{meshLevel.toFixed(0)}%</span>
                        <span className={styles.visualDesc}>Garbage Level</span>
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

            {/* ── Sparkline ── */}
            {sparkPoints.length > 1 && (
                <div className={styles.sparklineWrapper}>
                    <span className={styles.sparklineLabel}>Garbage fill trend</span>
                    <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={sparkPoints} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`spark-mesh-${bucket.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor={garbageColor} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={garbageColor} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="v"
                                stroke={garbageColor}
                                strokeWidth={2}
                                fill={`url(#spark-mesh-${bucket.id})`}
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
