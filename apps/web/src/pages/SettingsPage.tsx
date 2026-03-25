/**
 * SETTINGS PAGE — src/pages/SettingsPage.tsx
 * Placeholder — will contain alert threshold configuration.
 */
import styles from './Page.module.css'

export default function SettingsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Settings</h2>
                <p className={styles.subtitle}>Configure alert thresholds and system preferences</p>
            </div>
            <div className={styles.placeholder}>
                <span>⚙</span>
                <p>Settings form coming next</p>
            </div>
        </div>
    )
}
