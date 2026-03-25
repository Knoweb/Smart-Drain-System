/**
 * MAP PAGE — src/pages/MapPage.tsx
 * Now uses the real DrainMap component powered by live Supabase data.
 */
import { DrainMap } from '@/features/map/DrainMap'
import styles from './Page.module.css'

export default function MapPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Drain Map</h2>
                <p className={styles.subtitle}>
                    Click a marker to see live sensor readings · Color indicates current status
                </p>
            </div>
            <DrainMap />
        </div>
    )
}
