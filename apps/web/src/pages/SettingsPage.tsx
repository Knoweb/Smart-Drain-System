import styles from './SettingsPage.module.css'
import pageStyles from './Page.module.css'
import { useTheme } from '@/contexts/ThemeContext'

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme()

    return (
        <div className={pageStyles.page}>

            <div className={styles.settingsGrid}>
                {/* Theme Setting */}
                <div className={styles.settingCard}>
                    <div className={styles.settingInfo}>
                        <h3 className={styles.settingTitle}>Appearance Options</h3>
                        <p className={styles.settingDesc}>
                            Toggle between light and dark modes. Dark mode is recommended for monitoring dashboards.
                        </p>
                    </div>
                    
                    <div className={styles.settingAction}>
                        <label className={styles.toggleWrapper}>
                            <input 
                                type="checkbox" 
                                className={styles.toggleInput}
                                checked={theme === 'light'} 
                                onChange={toggleTheme} 
                            />
                            <div className={styles.toggleTrack}>
                                <div className={styles.toggleThumb} />
                                <span className={styles.toggleLabel}>
                                    {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Placeholder for future settings */}
                <div className={styles.settingCard}>
                    <div className={styles.settingInfo}>
                        <h3 className={styles.settingTitle}>Alert Thresholds</h3>
                        <p className={styles.settingDesc}>
                            Set the water level percentages for Warning and Critical alerts.
                        </p>
                    </div>
                    <div className={styles.settingAction}>
                        <button className={styles.btnSecondary} disabled>
                            Configure Limits (Coming soon)
                        </button>
                    </div>
                </div>

                <div className={styles.settingCard}>
                    <div className={styles.settingInfo}>
                        <h3 className={styles.settingTitle}>Notification Preferences</h3>
                        <p className={styles.settingDesc}>
                            Manage email and SMS alerts for critical drain events.
                        </p>
                    </div>
                    <div className={styles.settingAction}>
                        <button className={styles.btnSecondary} disabled>
                            Manage Notifications
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
