/**
 * DrainMap — src/features/map/DrainMap.tsx
 * ---------------------------------------------------------------------------
 * Exports:
 *   DrainMap        — the original full overview map (all drains, legend)
 *   DrainCardsGrid  — responsive grid of per-drain cards with embedded maps
 *   DrainDetailCard — single drain card
 */

import { Popup, Tooltip, useMap } from 'react-leaflet'
import { CircleMarker } from 'react-leaflet/CircleMarker'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { useDrains } from '@/hooks/useDrains'
import { DrainPopup, DevicePopup } from './DrainPopup'
import { MAP_CENTER, MAP_DEFAULT_ZOOM, STATUS_COLOR_MAP } from '@/config/constants'
import type { Drain } from '@/types'
import styles from './DrainMap.module.css'

// ── Reset-to-default-view control (renders inside MapContainer) ──────────────
// useMap() only works as a child of MapContainer, so this must be a component.
function ResetControl({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap()
    return (
        <button
            className={styles.resetBtn}
            title="Reset to default view"
            onClick={(e) => {
                e.stopPropagation()
                map.setView(center, zoom, { animate: true })
            }}
        >
            ⊹
        </button>
    )
}

// ── Full overview map (unchanged from original) ──────────────────────────────
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

            <MapContainer
                center={MAP_CENTER}
                zoom={MAP_DEFAULT_ZOOM}
                className={styles.map}
            >
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
                                color: '#ffffff',
                                weight: 2,
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -10]}>
                                <strong>{drain.name}</strong>
                                <br />
                                <span style={{ color }}>{drain.status}</span>
                            </Tooltip>
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

// ── Legend item helper ───────────────────────────────────────────────────────
function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            <span>{label}</span>
        </div>
    )
}

// ── Loading / Error skeleton shared across cards ─────────────────────────────
export function DrainCardsGrid() {
    const { drains, loading, error } = useDrains()

    if (loading) {
        return (
            <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={styles.skeleton} />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <span>⚠️</span>
                <p>Failed to load drains: {error}</p>
            </div>
        )
    }

    if (drains.length === 0) {
        return (
            <div className={styles.errorState}>
                <span>💧</span>
                <p>No drains found. Add rows to the <code>drains</code> table.</p>
            </div>
        )
    }

    return (
        <div className={styles.cardsGrid}>
            {drains.map(drain => (
                <DrainDetailCard key={drain.id} drain={drain} />
            ))}
        </div>
    )
}

// ── Individual drain card with embedded map ──────────────────────────────────
export function DrainDetailCard({ drain }: { drain: Drain }) {
    const devices = drain.iot_devices ?? []
    const statusColor = STATUS_COLOR_MAP[drain.status] ?? '#94a3b8'

    const hasDevices = devices.length > 0

    return (
        <div className={styles.card}>
            {/* ── Status accent bar ── */}
            <div className={styles.cardAccent} style={{ background: statusColor }} />

            {/* ── Map ── */}
            <div className={styles.cardMapWrapper}>
                <MapContainer
                    center={[drain.latitude, drain.longitude]}
                    zoom={hasDevices ? 17 : 16}
                    className={styles.cardMap}
                    scrollWheelZoom={false}
                    zoomControl={true}
                    attributionControl={false}
                    key={drain.id}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Drain area ring — large faint circle */}
                    <CircleMarker
                        center={[drain.latitude, drain.longitude]}
                        radius={28}
                        pathOptions={{
                            fillColor: statusColor,
                            fillOpacity: 0.08,
                            color: statusColor,
                            weight: 1.5,
                            dashArray: '5 4',
                        }}
                    />

                    {/* Drain main marker */}
                    <CircleMarker
                        center={[drain.latitude, drain.longitude]}
                        radius={13}
                        pathOptions={{
                            fillColor: statusColor,
                            fillOpacity: 0.9,
                            color: '#ffffff',
                            weight: 2.5,
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -14]} permanent={false}>
                            <strong>{drain.name}</strong>
                        </Tooltip>
                        <Popup minWidth={220} maxWidth={260}>
                            <DrainPopup drain={drain} />
                        </Popup>
                    </CircleMarker>

                    {/* IoT device markers */}
                    {devices.map(device => {
                        const devColor = STATUS_COLOR_MAP[device.status] ?? '#94a3b8'
                        return (
                            <CircleMarker
                                key={device.id}
                                center={[device.latitude, device.longitude]}
                                radius={7}
                                pathOptions={{
                                    fillColor: devColor,
                                    fillOpacity: 1,
                                    color: '#ffffff',
                                    weight: 2,
                                }}
                            >
                                <Tooltip direction="top" offset={[0, -8]}>
                                    <span>{device.name}</span>
                                    <br />
                                    <span style={{ color: devColor, fontSize: '0.8em' }}>{device.status}</span>
                                </Tooltip>
                                <Popup minWidth={220} maxWidth={260}>
                                    <DevicePopup device={device} drainName={drain.name} />
                                </Popup>
                            </CircleMarker>
                        )
                    })}

                    {/* Reset view button — renders inside the map via useMap() */}
                    <ResetControl
                        center={[drain.latitude, drain.longitude]}
                        zoom={hasDevices ? 17 : 16}
                    />
                </MapContainer>

                {/* Device count badge overlaid on map */}
                <div className={styles.deviceBadge}>
                    {devices.length} device{devices.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* ── Info row below the map ── */}
            <div className={styles.cardInfo}>
                <div className={styles.cardTitleRow}>
                    <h3 className={styles.cardTitle}>{drain.name}</h3>
                    <span
                        className={styles.statusPill}
                        style={{ color: statusColor, borderColor: statusColor, background: `${statusColor}18` }}
                    >
                        {drain.status}
                    </span>
                </div>

                <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                        <span className={styles.metaIcon}>📍</span>
                        {drain.latitude.toFixed(5)}, {drain.longitude.toFixed(5)}
                    </span>
                    {drain.baseline_depth_cm != null && (
                        <span className={styles.metaItem}>
                            <span className={styles.metaIcon}>📏</span>
                            Depth: {drain.baseline_depth_cm} cm
                        </span>
                    )}
                </div>

                {/* Device list under map */}
                {devices.length > 0 && (
                    <div className={styles.deviceList}>
                        {devices.map(device => {
                            const devColor = STATUS_COLOR_MAP[device.status] ?? '#94a3b8'
                            return (
                                <div key={device.id} className={styles.deviceRow}>
                                    <span className={styles.deviceDot} style={{ background: devColor }} />
                                    <span className={styles.deviceName}>{device.name}</span>
                                    <span className={styles.deviceStatus} style={{ color: devColor }}>
                                        {device.status}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}

                {devices.length === 0 && (
                    <p className={styles.noDevices}>No IoT devices installed</p>
                )}
            </div>
        </div>
    )
}

// kept for backward compat but no longer used in MapPage
export { DrainDetailCard as DrainDetailMap }
