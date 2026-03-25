/**
 * ALERTS PAGE — src/pages/AlertsPage.tsx
 * Now uses the AlertList component populated with live Supabase data.
 */
import { AlertList } from '@/features/alerts/AlertList'
import styles from './Page.module.css'

export default function AlertsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>System Alerts</h2>
                <p className={styles.subtitle}>
                    Active and historical alerts for blockages, high water levels, and battery issues
                </p>
            </div>

            <AlertList />
        </div>
    )
}
