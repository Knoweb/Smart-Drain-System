/**
 * DASHBOARD PAGE — src/pages/DashboardPage.tsx
 * Now fetches real drain counts from Supabase via useDrains hook.
 */
import { useDrains } from '@/hooks/useDrains'
import type { DrainStatus } from '@/types'
import styles from './Page.module.css'

export default function DashboardPage() {
    const { drains, loading, error } = useDrains()

    // Compute status counts from the live data
    const countByStatus = (status: DrainStatus) =>
        drains.filter(d => d.status === status).length

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Overview</h2>
                <p className={styles.subtitle}>Real-time summary of all drain sensors</p>
            </div>

            {error && (
                <div className={styles.errorBanner}>
                    ⚠️ Could not load drains: {error}
                </div>
            )}

            {/* ── Stat cards ── */}
            <div className={styles.statGrid}>
                <StatCard
                    label="Total Drains"
                    value={loading ? '…' : String(drains.length)}
                    color="primary"
                />
                <StatCard
                    label="Operational"
                    value={loading ? '…' : String(countByStatus('OPERATIONAL'))}
                    color="operational"
                />
                <StatCard
                    label="Warning"
                    value={loading ? '…' : String(countByStatus('WARNING'))}
                    color="warning"
                />
                <StatCard
                    label="Critical"
                    value={loading ? '…' : String(countByStatus('CRITICAL'))}
                    color="critical"
                />
            </div>

            {/* ── Drain list ── */}
            {!loading && drains.length > 0 && (
                <div className={styles.drainTable}>
                    <h3 className={styles.tableTitle}>Drain Locations</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Lat</th>
                                <th>Long</th>
                                <th>Depth (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drains.map(drain => (
                                <tr key={drain.id}>
                                    <td>{drain.name}</td>
                                    <td>
                                        <span className={`${styles.statusPill} ${styles[`pill--${drain.status.toLowerCase()}`]}`}>
                                            {drain.status}
                                        </span>
                                    </td>
                                    <td>{drain.latitude}</td>
                                    <td>{drain.longitude}</td>
                                    <td>{drain.baseline_depth_cm ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && drains.length === 0 && !error && (
                <div className={styles.placeholder}>
                    <span>💧</span>
                    <p>No drains found. Insert rows into the <code>drains</code> table in Supabase.</p>
                </div>
            )}
        </div>
    )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className={`${styles.statCard} ${styles[`card--${color}`]}`}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
        </div>
    )
}
