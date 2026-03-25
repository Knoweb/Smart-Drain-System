/**
 * DrainPopup — src/features/map/DrainPopup.tsx
 * ---------------------------------------------------------------------------
 * This is the card that appears INSIDE the Leaflet map popup when a user
 * clicks on a drain marker. It fetches the latest sensor reading for that
 * drain using our useLatestReading hook.
 *
 * CONCEPT: Separation of concerns
 * - DrainMap handles the MAP (markers, tile layer)
 * - DrainPopup handles the DATA DISPLAY for one selected drain
 * Each component has one job.
 */

import { useLatestReading } from '@/hooks/useLatestReading'
import type { Drain } from '@/types'
import { STATUS_COLOR_MAP } from '@/config/constants'
import styles from './DrainPopup.module.css'

interface Props {
    drain: Drain
}

export function DrainPopup({ drain }: Props) {
    const { reading, loading } = useLatestReading(drain.id)
    const statusColor = STATUS_COLOR_MAP[drain.status] ?? '#94a3b8'

    return (
        <div className={styles.popup}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <span className={styles.name}>{drain.name}</span>
                <span className={styles.badge} style={{ color: statusColor, borderColor: statusColor }}>
                    {drain.status}
                </span>
            </div>

            {/* ── Reading values ── */}
            {loading ? (
                <p className={styles.loading}>Loading readings…</p>
            ) : reading ? (
                <div className={styles.grid}>
                    <Metric
                        label="Water Level"
                        value={`${reading.water_level_pct.toFixed(1)}%`}
                        highlight={reading.water_level_pct >= 80}
                    />
                    <Metric
                        label="Pressure"
                        value={reading.water_pressure_psi != null
                            ? `${reading.water_pressure_psi.toFixed(1)} psi`
                            : 'N/A'}
                    />
                    <Metric
                        label="Temperature"
                        value={reading.temperature_c != null
                            ? `${reading.temperature_c.toFixed(1)} °C`
                            : 'N/A'}
                    />
                    <Metric
                        label="Battery"
                        value={reading.battery_level_pct != null
                            ? `${reading.battery_level_pct}%`
                            : 'N/A'}
                        highlight={(reading.battery_level_pct ?? 100) < 20}
                    />
                </div>
            ) : (
                <p className={styles.loading}>No readings yet</p>
            )}

            {/* ── Timestamp ── */}
            {reading && (
                <p className={styles.timestamp}>
                    Last updated: {new Date(reading.recorded_at).toLocaleString()}
                </p>
            )}
        </div>
    )
}

// ── Small metric cell ────────────────────────────────────────────────────────
function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={styles.metric}>
            <span className={styles.metricLabel}>{label}</span>
            <span
                className={styles.metricValue}
                style={highlight ? { color: '#ef4444' } : undefined}
            >
                {value}
            </span>
        </div>
    )
}
