import { useDrains } from '@/hooks/useDrains'
import { SensorCard } from '@/features/sensors/SensorCard'
import styles from './Page.module.css'

export default function SensorsPage() {
    const { drains, loading, error } = useDrains()

    return (
        <div className={styles.page}>

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
                <div className={styles.groupsContainer} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {drains.map(drain => {
                        const devices = drain.iot_devices || []
                        return (
                            <div key={drain.id} className={styles.drainGroup}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                                    {drain.name}
                                </h3>
                                {devices.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No IoT devices configured for this drain.</p>
                                ) : (
                                    <div className={styles.grid}>
                                        {devices.map(device => (
                                            <SensorCard key={device.id} device={device} drainName={drain.name} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
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
