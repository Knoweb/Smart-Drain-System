/**
 * MAP PAGE — src/pages/MapPage.tsx
 * ---------------------------------------------------------------------------
 * Layout:
 *   1. Full overview map  — original DrainMap (all drains on one map)
 *   2. "Detailed Device Locations" — per-drain cards with individual maps
 */
import { DrainMap, DrainCardsGrid } from '@/features/map/DrainMap'
import styles from './MapPage.module.css'

export default function MapPage() {
    return (
        <div className={styles.page}>

            {/* ── 1. Full overview map (unchanged) ── */}
            <DrainMap />

            {/* ── 2. Per-drain detail cards ── */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Detailed Device Locations</h3>
                    <p className={styles.sectionDesc}>
                        Each drain site showing the precise location of its IoT sensor nodes.
                        Click any marker for live readings.
                    </p>
                </div>
                <DrainCardsGrid />
            </div>

        </div>
    )
}
