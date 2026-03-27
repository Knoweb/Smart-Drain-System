/**
 * MAP PAGE — src/pages/MapPage.tsx
 * Now uses the real DrainMap component powered by live Supabase data.
 */
import { DrainMap, DrainDetailMap } from '@/features/map/DrainMap'
import { useDrains } from '@/hooks/useDrains'
import styles from './Page.module.css'

export default function MapPage() {
    const { drains } = useDrains()

    const sortedDrains = [...drains].sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div className={styles.page}>
            
            {/* The main overhead map (Drains only) */}
            <DrainMap />

            {/* Individual detailed maps (IoT Devices only) */}
            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                    Detailed Device Locations
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Below are the individual drain sites showing the precise mapping of IoT sensor nodes.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    {sortedDrains.map(drain => (
                        <DrainDetailMap key={drain.id} drain={drain} />
                    ))}
                </div>
            </div>
        </div>
    )
}
