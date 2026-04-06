/**
 * DASHBOARD PAGE — src/pages/DashboardPage.tsx
 * ---------------------------------------------------------------------------
 * The main monitoring overview. Shows:
 *
 *   1. Stat cards  — live counts: total / operational / warning / critical
 *   2. Charts row  — StatusPieChart (donut) + WaterLevelTrendChart (24h line)
 *   3. Drain table — list of all drain locations with status badges
 *
 * Data flow:
 *   useDrains()             → stat cards + donut + drain table (live Realtime)
 *   useHistoricalReadings() → trend chart (24h snapshot, no Realtime needed)
 */

import { useDrains } from '@/hooks/useDrains'
import { useHistoricalReadings } from '@/hooks/useHistoricalReadings'
import type { DrainStatus } from '@/types'
import { StatusPieChart } from '@/features/dashboard/StatusPieChart'
import { WaterLevelTrendChart } from '@/features/dashboard/WaterLevelTrendChart'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const { drains, loading: drainsLoading, error: drainsError } = useDrains()
    const { readings, loading: readingsLoading } = useHistoricalReadings('24h', 'all')

    const countByStatus = (status: DrainStatus) =>
        drains.filter(d => d.status === status).length

    return (
        <div className={styles.page}>

            {drainsError && (
                <div className={styles.errorBanner}>
                    ⚠️ Could not load drains: {drainsError}
                </div>
            )}

            {/* ── 1. Stat Cards ── */}
            <div className={styles.statGrid}>
                <StatCard
                    label="Total Drains"
                    value={drainsLoading ? '…' : String(drains.length)}
                    color="primary"
                    icon="🌊"
                    sublabel="Monitored sites"
                />
                <StatCard
                    label="Operational"
                    value={drainsLoading ? '…' : String(countByStatus('OPERATIONAL'))}
                    color="operational"
                    icon="✅"
                    sublabel="Running normally"
                />
                <StatCard
                    label="Warning"
                    value={drainsLoading ? '…' : String(countByStatus('WARNING'))}
                    color="warning"
                    icon="⚠️"
                    sublabel="Needs attention"
                />
                <StatCard
                    label="Critical"
                    value={drainsLoading ? '…' : String(countByStatus('CRITICAL'))}
                    color="critical"
                    icon="🚨"
                    sublabel="Immediate action required"
                />
            </div>

            {/* ── 2. Charts Row ── */}
            {!drainsLoading && drains.length > 0 && (
                <div className={styles.chartsRow}>
                    {/* Left: Donut breakdown */}
                    <div className={styles.pieWrapper}>
                        <StatusPieChart drains={drains} />
                    </div>

                    {/* Right: 24h line trend */}
                    <div className={styles.trendWrapper}>
                        <WaterLevelTrendChart
                            readings={readings}
                            loading={readingsLoading}
                        />
                    </div>
                </div>
            )}

            {/* ── 3. Drain Table ── */}
            {!drainsLoading && drains.length > 0 && (
                <div className={styles.tableCard}>
                    <h3 className={styles.tableTitle}>Drain Locations</h3>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Devices</th>
                                    <th>Latitude</th>
                                    <th>Longitude</th>
                                    <th>Baseline Depth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drains.map(drain => (
                                    <tr key={drain.id}>
                                        <td className={styles.nameCell}>
                                            <span className={styles.drainIcon}>💧</span>
                                            {drain.name}
                                        </td>
                                        <td>
                                            <span className={`${styles.statusPill} ${styles[`pill--${drain.status.toLowerCase()}`]}`}>
                                                {drain.status}
                                            </span>
                                        </td>
                                        <td className={styles.deviceCount}>
                                            {drain.iot_devices?.length ?? 0}
                                        </td>
                                        <td className={styles.coord}>{drain.latitude.toFixed(5)}</td>
                                        <td className={styles.coord}>{drain.longitude.toFixed(5)}</td>
                                        <td>{drain.baseline_depth_cm != null ? `${drain.baseline_depth_cm} cm` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Empty state ── */}
            {!drainsLoading && drains.length === 0 && !drainsError && (
                <div className={styles.placeholder}>
                    <span className={styles.placeholderIcon}>💧</span>
                    <p>No drains found. Insert rows into the <code>drains</code> table in Supabase.</p>
                </div>
            )}
        </div>
    )
}

// ── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
    label: string
    value: string
    color: string
    icon: string
    sublabel: string
}

function StatCard({ label, value, color, icon, sublabel }: StatCardProps) {
    return (
        <div className={`${styles.statCard} ${styles[`card--${color}`]}`}>
            <div className={styles.statIcon}>{icon}</div>
            <div className={styles.statBody}>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statSublabel}>{sublabel}</span>
            </div>
        </div>
    )
}
