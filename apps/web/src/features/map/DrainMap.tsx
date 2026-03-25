/**
 * DrainMap — src/features/map/DrainMap.tsx
 * ---------------------------------------------------------------------------
 * The interactive React-Leaflet map showing all drain locations as
 * color-coded circle markers. Click a marker to see live sensor readings.
 *
 * KEY CONCEPTS YOU'LL LEARN HERE:
 *
 * 1. MapContainer: The root Leaflet component. Sets start position and zoom.
 *    You can only have ONE MapContainer per page.
 *
 * 2. TileLayer: The map background tiles (the actual street map imagery).
 *    We use OpenStreetMap — free, no API key needed.
 *
 * 3. CircleMarker: A circular dot on the map at lat/lng coordinates.
 *    We color it based on drain.status (green/amber/red).
 *
 * 4. Popup: Shows a card when user clicks a marker.
 *    We render our <DrainPopup> component inside it.
 *
 * 5. Tooltip: Small label shown on hover (before clicking).
 */

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { useDrains } from '@/hooks/useDrains'
import { DrainPopup } from './DrainPopup'
import { MAP_CENTER, MAP_DEFAULT_ZOOM, STATUS_COLOR_MAP } from '@/config/constants'
import styles from './DrainMap.module.css'

export function DrainMap() {
    const { drains, loading, error } = useDrains()

    if (loading) {
        return (
            <div className={styles.state}>
                <div className={styles.spinner} />
                <p>Loading drains…</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.state}>
                <span style={{ fontSize: '2rem' }}>⚠️</span>
                <p>Failed to load drains: {error}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Check your Supabase credentials and RLS policies.
                </p>
            </div>
        )
    }

    return (
        <div className={styles.mapWrapper}>
            {/* ── Legend ── */}
            <div className={styles.legend}>
                <LegendItem color="#22c55e" label="Operational" />
                <LegendItem color="#f59e0b" label="Warning" />
                <LegendItem color="#ef4444" label="Critical" />
            </div>

            {/* ── Drain count badge ── */}
            <div className={styles.countBadge}>
                {drains.length} drain{drains.length !== 1 ? 's' : ''} monitored
            </div>

            {/* ── The actual Leaflet map ── */}
            <MapContainer
                center={MAP_CENTER}
                zoom={MAP_DEFAULT_ZOOM}
                className={styles.map}
            // scrollWheelZoom allowed — good UX for embedded maps
            >
                {/* OpenStreetMap tile layer — no API key required */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {drains.map((drain) => {
                    const color = STATUS_COLOR_MAP[drain.status] ?? '#94a3b8'

                    return (
                        <CircleMarker
                            key={drain.id}
                            center={[drain.latitude, drain.longitude]}
                            radius={14}
                            pathOptions={{
                                fillColor: color,
                                fillOpacity: 0.85,
                                color: '#ffffff',     // white border ring
                                weight: 2,
                            }}
                        >
                            {/* Tooltip: shown on hover */}
                            <Tooltip direction="top" offset={[0, -10]}>
                                <strong>{drain.name}</strong>
                                <br />
                                <span style={{ color }}>{drain.status}</span>
                            </Tooltip>

                            {/* Popup: shown on click — contains our live-data card */}
                            <Popup minWidth={240} maxWidth={280}>
                                <DrainPopup drain={drain} />
                            </Popup>
                        </CircleMarker>
                    )
                })}
            </MapContainer>
        </div>
    )
}

// ── Legend item ──────────────────────────────────────────────────────────────
function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            <span>{label}</span>
        </div>
    )
}
