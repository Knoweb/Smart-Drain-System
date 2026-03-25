/**
 * SENSORS PAGE — src/pages/SensorsPage.tsx
 * Uses useDrains to get all monitored locations, and maps them to SensorCards.
 */
import { useDrains } from '@/hooks/useDrains'
import { SensorCard } from '@/features/sensors/SensorCard'
import styles from './Page.module.css'
import sensorStyles from '@/features/sensors/SensorCard.module.css' // We'll share the grid

export default function SensorsPage() {
    const { drains, loading, error } = useDrains()

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Sensor Readings</h2>
                <p className={styles.subtitle}>Live telemetry updated via WebSockets — water level, pressure, temp, battery</p>
            </div>

            {error && (
                <div className={styles.errorBanner}>
                    ⚠️ Could not load drains: {error}
                </div>
            )}

            {loading ? (
                <div className={styles.placeholder}>
                    <div className="spinner" />
                    <p>Loading sensors…</p>
                </div>
            ) : drains.length > 0 ? (
                <div className={styles.grid}>
                    {drains.map(drain => (
                        <SensorCard key={drain.id} drain={drain} />
                    ))}
                </div>
            ) : (
                <div className={styles.placeholder}>
                    <span>📡</span>
                    <p>No active drains found in database.</p>
                </div>
            )}
        </div>
    )
}
