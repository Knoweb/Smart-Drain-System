/**
 * ALERTS PAGE — src/pages/AlertsPage.tsx
 * Now uses the AlertList component populated with live Supabase data.
 */
import { AlertList } from '@/features/alerts/AlertList'
import styles from './Page.module.css'

export default function AlertsPage() {
    return (
        <div className={styles.page}>

            <AlertList />
        </div>
    )
}
