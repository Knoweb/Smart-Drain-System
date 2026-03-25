/**
 * AlertList — src/features/alerts/AlertList.tsx
 * ---------------------------------------------------------------------------
 * Renders the list of alerts fetched from Supabase.
 * Includes a "Mark Resolved" button for active alerts.
 */

import { useAlerts } from '@/hooks/useAlerts'
import type { Alert } from '@/types'
import styles from './AlertList.module.css'

export function AlertList() {
    const { alerts, loading, error, resolveAlert } = useAlerts()

    if (loading) {
        return (
            <div className={styles.container}>
                <div className="spinner" />
                <p className={styles.mutedText}>Loading alert history…</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.errorBanner}>
                ⚠️ Failed to load alerts: {error}
            </div>
        )
    }

    if (alerts.length === 0) {
        return (
            <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🎉</span>
                <p>No alerts in the system. Everything is running smoothly.</p>
                <p className={styles.mutedText}>
                    When sensors report low battery or water levels &gt; 80%, alerts will appear here.
                </p>
            </div>
        )
    }

    return (
        <div className={styles.list}>
            {alerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} onResolve={() => resolveAlert(alert.id)} />
            ))}
        </div>
    )
}

function AlertCard({ alert, onResolve }: { alert: Alert; onResolve: () => void }) {
    // Determine colors based on alert type
    const isResolved = alert.is_resolved
    const isHighWater = alert.alert_type === 'HIGH_WATER_LEVEL'
    const isLowBattery = alert.alert_type === 'LOW_BATTERY'

    // If resolved, it's grayed out. Otherwise, Red for water, Amber for battery.
    const themeClass = isResolved
        ? styles.resolved
        : isHighWater
            ? styles.critical
            : isLowBattery
                ? styles.warning
                : styles.default

    const icon = isHighWater ? '🌊' : isLowBattery ? '🔋' : '⚠️'
    // Remember we joined the drains table, so the name is accessible inside drains object
    // @ts-expect-error Types definition handles this correctly but TS sometimes complains about joins
    const drainName = alert.drains?.name ?? 'Unknown Drain Location'

    return (
        <div className={`${styles.card} ${themeClass}`}>
            <div className={styles.cardIcon}>{icon}</div>

            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <h4 className={styles.drainName}>{drainName}</h4>
                    <span className={styles.timestamp}>
                        {new Date(alert.created_at).toLocaleString()}
                    </span>
                </div>

                <p className={styles.alertType}>{alert.alert_type.replace(/_/g, ' ')}</p>

                {alert.message && (
                    <p className={styles.message}>{alert.message}</p>
                )}
            </div>

            <div className={styles.cardActions}>
                {isResolved ? (
                    <span className={styles.resolvedBadge}>✓ Resolved</span>
                ) : (
                    <button className={styles.resolveBtn} onClick={onResolve}>
                        Mark Resolved
                    </button>
                )}
            </div>
        </div>
    )
}
