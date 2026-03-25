/**
 * REPORTS PAGE — src/pages/ReportsPage.tsx
 * Placeholder — will handle CSV/PDF data export.
 */
import styles from './Page.module.css'

export default function ReportsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Reports</h2>
                <p className={styles.subtitle}>Export historical sensor data as CSV or PDF</p>
            </div>
            <div className={styles.placeholder}>
                <span>📊</span>
                <p>Date-range picker and export buttons coming next</p>
            </div>
        </div>
    )
}
