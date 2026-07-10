import { useState, useEffect, useMemo } from 'react'
import { ref, push, set, onValue } from 'firebase/database'
import { db } from '@/lib/firebase'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import styles from './RegisterPage.module.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// ── Leaflet icon fix ──────────────────────────────────────────────────────────
const customIcon = new L.Icon({
    iconUrl,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

// ── Types ─────────────────────────────────────────────────────────────────────
interface RegisteredDevice {
    id: string
    parent_name: string
    parent_id: string
    device_id: string
    device_name: string
    device_type: string
    location: string
    latitude: number
    longitude: number
    registered_at: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const NEW = '__new__'
const COL_BLUE   = '#3b82f6'
const COL_AMBER  = '#f59e0b'

function padId(n: number) { return String(n).padStart(2, '0') }
function nextDeviceId(count: number) { return `Device_${padId(count + 1)}` }

// ── Map helpers ───────────────────────────────────────────────────────────────
function LocationMarker({ position, setPosition }: {
    position: [number, number] | null
    setPosition: (p: [number, number]) => void
}) {
    useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]) } })
    return position ? <Marker position={position} icon={customIcon} /> : null
}

function MapUpdater({ center }: { center: [number, number] | null }) {
    const map = useMap()
    useEffect(() => { if (center) map.flyTo(center, 15) }, [center, map])
    return null
}

// ── Location + Map Panel ──────────────────────────────────────────────────────
function LocationPanel({ location, setLocation, position, setPosition, search, setSearch }: {
    location: string
    setLocation: (v: string) => void
    position: [number, number] | null
    setPosition: (p: [number, number]) => void
    search: string
    setSearch: (v: string) => void
}) {
    const doSearch = async () => {
        if (!search.trim()) return
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
            )
            const data = await res.json()
            if (data?.length > 0) {
                setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)])
                if (!location) setLocation(data[0].display_name.split(',')[0])
            } else {
                alert('Location not found.')
            }
        } catch {
            alert('Search failed.')
        }
    }

    return (
        <div className={styles.locationPanel}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Location Description</label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Near the canal bridge"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>
                    Pin on Map (Optional)
                </label>
                <div className={styles.mapWrap}>
                    <div className={styles.mapSearch}>
                        <input
                            type="text"
                            className={styles.mapSearchInput}
                            placeholder="Search location..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') { e.preventDefault(); doSearch() }
                            }}
                        />
                        <button type="button" className={styles.mapSearchBtn} onClick={doSearch}>
                            Search
                        </button>
                    </div>
                    <MapContainer
                        center={[6.9271, 79.8612]}
                        zoom={12}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                    >
                        <TileLayer
                            attribution="&copy; OpenStreetMap"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} />
                        <MapUpdater center={position} />
                    </MapContainer>
                </div>
                {position && (
                    <p className={styles.coordHint}>
                        📍 {position[0].toFixed(5)}, {position[1].toFixed(5)}
                    </p>
                )}
            </div>
        </div>
    )
}

// ── Parent Selector (top-level — never inside RegisterPage) ───────────────────
interface ParentSelectorProps {
    type: 'drain' | 'mesh'
    choice: string
    setChoice: (v: string) => void
    newName: string
    setNewName: (v: string) => void
    existingSystems: { id: string; name: string }[]
    newId: string
}

function ParentSelector({
    type, choice, setChoice, newName, setNewName, existingSystems, newId,
}: ParentSelectorProps) {
    const hasExisting = existingSystems.length > 0
    const label       = type === 'drain' ? 'Drain System' : 'Mesh Bucket'
    const subLabel    = type === 'drain' ? 'System' : 'Bucket'
    const placeholder = type === 'drain' ? 'e.g. Kelaniya Drain' : 'e.g. Pettah Market'

    return (
        <div className={styles.fieldGroup}>
            <div className={styles.fieldGroupLabel}>🏗 {label} (Parent)</div>

            <div className={styles.modeToggle}>
                <button
                    type="button"
                    className={`${styles.modeBtn} ${choice !== NEW ? styles.modeBtnActive : ''}`}
                    onClick={() => setChoice(existingSystems[0]?.id ?? NEW)}
                    disabled={!hasExisting}
                >
                    Select Existing
                </button>
                <button
                    type="button"
                    className={`${styles.modeBtn} ${choice === NEW ? styles.modeBtnActive : ''}`}
                    onClick={() => setChoice(NEW)}
                >
                    + Create New
                </button>
            </div>

            {choice === NEW ? (
                <div className={styles.inlineRow}>
                    <div className={styles.inlineField}>
                        <label className={styles.label}>
                            {subLabel} ID <span className={styles.autoTag}>Auto</span>
                        </label>
                        <input
                            type="text"
                            className={`${styles.input} ${styles.inputAuto}`}
                            value={newId}
                            readOnly
                        />
                    </div>
                    <div className={styles.inlineField}>
                        <label className={styles.label}>{subLabel} Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={placeholder}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                    </div>
                </div>
            ) : (
                <div className={styles.inlineRow}>
                    <div className={styles.inlineField}>
                        <label className={styles.label}>Select {subLabel}</label>
                        <select
                            className={`${styles.input} ${styles.select}`}
                            value={choice}
                            onChange={e => setChoice(e.target.value)}
                        >
                            {existingSystems.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.id} — {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inlineField}>
                        <label className={styles.label}>Selected Name</label>
                        <input
                            type="text"
                            className={`${styles.input} ${styles.inputAuto}`}
                            value={existingSystems.find(s => s.id === choice)?.name ?? ''}
                            readOnly
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Registered list column ────────────────────────────────────────────────────
function RegisteredColumn({ title, emoji, color, groups }: {
    title: string
    emoji: string
    color: string
    groups: Record<string, RegisteredDevice[]>
}) {
    const isEmpty = Object.keys(groups).length === 0
    return (
        <div className={styles.registeredCol}>
            <div className={styles.registeredColHeader} style={{ borderColor: color }}>
                <span>{emoji}</span>
                <span>{title}</span>
            </div>
            {isEmpty ? (
                <div className={styles.emptyState}>No registrations yet</div>
            ) : (
                Object.entries(groups).map(([parentId, devices]) => (
                    <div key={parentId} className={styles.parentCard}>
                        <div className={styles.parentCardHead} style={{ borderLeftColor: color }}>
                            <span className={styles.parentCardId}>{parentId}</span>
                            <span className={styles.parentCardName}>{devices[0]?.parent_name}</span>
                            <span className={styles.badge} style={{ background: color }}>
                                {devices.length}
                            </span>
                        </div>
                        {devices.map(d => (
                            <div key={d.id} className={styles.deviceItem}>
                                <span className={styles.devIcon}>{emoji}</span>
                                <div className={styles.devInfo}>
                                    <span className={styles.devId}>{d.device_id}</span>
                                    {d.device_name && (
                                        <span className={styles.devName}>{d.device_name}</span>
                                    )}
                                    <span className={styles.devLoc}>📍 {d.location}</span>
                                </div>
                                <span className={styles.devDate}>
                                    {new Date(d.registered_at).toLocaleDateString('en-GB', {
                                        day: '2-digit', month: 'short',
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    )
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// =============================================================================
export default function RegisterPage() {

    // ── Registered devices list ───────────────────────────────────────────
    const [registeredList, setRegisteredList] = useState<RegisteredDevice[]>([])

    useEffect(() => {
        const unsub = onValue(ref(db, 'registered_devices'), snap => {
            const items: RegisteredDevice[] = [
                {
                    id: 'default_drain_01',
                    parent_id: 'Smart Drain 01',
                    parent_name: 'Smart Drain 01',
                    device_id: 'Device-01',
                    device_name: 'Main Drain Sensor',
                    device_type: 'drain_sensor',
                    location: 'Kelaniya Main Canal',
                    latitude: 6.9533,
                    longitude: 79.9140,
                    registered_at: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'default_mesh_01',
                    parent_id: 'Mesh Bucket 01',
                    parent_name: 'Mesh Bucket 01',
                    device_id: 'Device-02',
                    device_name: 'Main Mesh Bucket',
                    device_type: 'mesh_bucket',
                    location: 'Kelaniya Main Canal',
                    latitude: 6.9533,
                    longitude: 79.9140,
                    registered_at: '2024-01-01T00:00:00.000Z'
                }
            ]
            
            if (snap.exists()) {
                snap.forEach(c => items.push({ id: c.key!, ...c.val() }))
            }
            
            items.sort((a, b) =>
                new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime()
            )
            setRegisteredList(items)
        })
        return () => unsub()
    }, [])

    // ── Derive existing parent systems ────────────────────────────────────
    const existingDrainSystems = useMemo(() => {
        const map = new Map<string, string>()
        registeredList
            .filter(d => d.device_type === 'drain_sensor')
            .forEach(d => { if (!map.has(d.parent_id)) map.set(d.parent_id, d.parent_name) })
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
    }, [registeredList])

    const existingMeshSystems = useMemo(() => {
        const map = new Map<string, string>()
        registeredList
            .filter(d => d.device_type === 'mesh_bucket')
            .forEach(d => { if (!map.has(d.parent_id)) map.set(d.parent_id, d.parent_name) })
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
    }, [registeredList])

    // ── Auto-generated next parent IDs ────────────────────────────────────
    const nextDrainParentId = `Smart_Drain_${padId(existingDrainSystems.length + 1)}`
    const nextMeshParentId  = `Mesh_Bucket_${padId(existingMeshSystems.length + 1)}`

    // ── Drain form state ──────────────────────────────────────────────────
    const [drainParentChoice, setDrainParentChoice] = useState(NEW)
    const [drainNewName,      setDrainNewName]      = useState('')
    const [drainDeviceName,   setDrainDeviceName]   = useState('')
    const [drainLocation,     setDrainLocation]     = useState('')
    const [drainPosition,     setDrainPosition]     = useState<[number, number] | null>(null)
    const [drainSearch,       setDrainSearch]       = useState('')
    const [drainSubmitting,   setDrainSubmitting]   = useState(false)
    const [drainSuccess,      setDrainSuccess]      = useState('')

    // ── Mesh form state ───────────────────────────────────────────────────
    const [meshParentChoice,  setMeshParentChoice]  = useState(NEW)
    const [meshNewName,       setMeshNewName]       = useState('')
    const [meshDeviceName,    setMeshDeviceName]    = useState('')
    const [meshLocation,      setMeshLocation]      = useState('')
    const [meshPosition,      setMeshPosition]      = useState<[number, number] | null>(null)
    const [meshSearch,        setMeshSearch]        = useState('')
    const [meshSubmitting,    setMeshSubmitting]    = useState(false)
    const [meshSuccess,       setMeshSuccess]       = useState('')

    // ── Derived parent IDs / names ────────────────────────────────────────
    const drainParentId = drainParentChoice === NEW ? nextDrainParentId : drainParentChoice
    const drainParentName = drainParentChoice === NEW
        ? drainNewName
        : (existingDrainSystems.find(s => s.id === drainParentChoice)?.name ?? '')

    const meshParentId = meshParentChoice === NEW ? nextMeshParentId : meshParentChoice
    const meshParentName = meshParentChoice === NEW
        ? meshNewName
        : (existingMeshSystems.find(s => s.id === meshParentChoice)?.name ?? '')

    // ── Auto device sub-IDs ───────────────────────────────────────────────
    const drainDeviceId = nextDeviceId(
        registeredList.filter(d => d.device_type === 'drain_sensor' && d.parent_id === drainParentId).length
    )
    const meshDeviceId = nextDeviceId(
        registeredList.filter(d => d.device_type === 'mesh_bucket' && d.parent_id === meshParentId).length
    )

    // ── Submit helpers ────────────────────────────────────────────────────
    const writeDevice = async (
        parentId: string, parentName: string,
        deviceId: string, deviceName: string,
        dtype: string, location: string,
        pos: [number, number] | null
    ) => {
        const lat = pos ? pos[0] : 0
        const lng = pos ? pos[1] : 0

        await set(push(ref(db, 'registered_devices')), {
            parent_id: parentId, parent_name: parentName,
            device_id: deviceId, device_name: deviceName,
            device_type: dtype, location,
            latitude: lat, longitude: lng,
            registered_at: new Date().toISOString(),
        })
        await set(push(ref(db, 'sensor_logs')), {
            device_id: parentId, sub_id: deviceId, device_type: dtype,
            latitude: lat, longitude: lng, timestamp: Date.now(),
            water_level_pct: 0, water_pressure_psi: 0,
            temperature_c: 25, battery_level_pct: 100, mesh_level_pct: 0,
        })
    }

    const handleDrainSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (drainParentChoice === NEW && !drainNewName.trim()) {
            alert('Please enter a System Name.'); return
        }
        setDrainSubmitting(true); setDrainSuccess('')
        try {
            await writeDevice(
                drainParentId, drainParentName,
                drainDeviceId, drainDeviceName,
                'drain_sensor', drainLocation, drainPosition
            )
            setDrainSuccess(`✅ ${drainDeviceId} registered under ${drainParentId}`)
            setDrainDeviceName(''); setDrainLocation('')
            setDrainPosition(null); setDrainSearch('')
            setDrainParentChoice(drainParentId)
            setDrainNewName('')
        } catch (err: any) {
            alert('Failed: ' + err.message)
        } finally {
            setDrainSubmitting(false)
        }
    }

    const handleMeshSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (meshParentChoice === NEW && !meshNewName.trim()) {
            alert('Please enter a Bucket Name.'); return
        }
        setMeshSubmitting(true); setMeshSuccess('')
        try {
            await writeDevice(
                meshParentId, meshParentName,
                meshDeviceId, meshDeviceName,
                'mesh_bucket', meshLocation, meshPosition
            )
            setMeshSuccess(`✅ ${meshDeviceId} registered under ${meshParentId}`)
            setMeshDeviceName(''); setMeshLocation('')
            setMeshPosition(null); setMeshSearch('')
            setMeshParentChoice(meshParentId)
            setMeshNewName('')
        } catch (err: any) {
            alert('Failed: ' + err.message)
        } finally {
            setMeshSubmitting(false)
        }
    }

    // ── Grouped display lists ─────────────────────────────────────────────
    const drainGroups = useMemo(() =>
        registeredList
            .filter(d => d.device_type === 'drain_sensor')
            .reduce<Record<string, RegisteredDevice[]>>((acc, d) => {
                ;(acc[d.parent_id] = acc[d.parent_id] || []).push(d)
                return acc
            }, {}),
        [registeredList]
    )

    const meshGroups = useMemo(() =>
        registeredList
            .filter(d => d.device_type === 'mesh_bucket')
            .reduce<Record<string, RegisteredDevice[]>>((acc, d) => {
                ;(acc[d.parent_id] = acc[d.parent_id] || []).push(d)
                return acc
            }, {}),
        [registeredList]
    )

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className={styles.pageRoot}>

            {/* ══ Split form ══════════════════════════════════════════════ */}
            <div className={styles.splitWrapper}>

                {/* LEFT — Drain System */}
                <form className={`${styles.panel} ${styles.panelDrain}`} onSubmit={handleDrainSubmit}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelHeaderInner}>
                            <span className={styles.panelIcon}>💧</span>
                            <div>
                                <h2 className={styles.panelTitle}>Drain System</h2>
                                <p className={styles.panelSub}>Register Smart Drain IoT devices</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.panelBody}>
                        {drainSuccess && (
                            <div className={styles.successBanner}>{drainSuccess}</div>
                        )}

                        <ParentSelector
                            type="drain"
                            choice={drainParentChoice}
                            setChoice={setDrainParentChoice}
                            newName={drainNewName}
                            setNewName={setDrainNewName}
                            existingSystems={existingDrainSystems}
                            newId={nextDrainParentId}
                        />

                        <div className={styles.fieldGroup}>
                            <div className={styles.fieldGroupLabel}>📡 IoT Device (Sub)</div>
                            <div className={styles.inlineRow}>
                                <div className={styles.inlineField}>
                                    <label className={styles.label}>
                                        Device ID <span className={styles.autoTag}>Auto</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`${styles.input} ${styles.inputAuto}`}
                                        value={drainDeviceId}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.inlineField}>
                                    <label className={styles.label}>Device Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="e.g. Inlet Sensor"
                                        value={drainDeviceName}
                                        onChange={e => setDrainDeviceName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <LocationPanel
                            location={drainLocation}
                            setLocation={setDrainLocation}
                            position={drainPosition}
                            setPosition={setDrainPosition}
                            search={drainSearch}
                            setSearch={setDrainSearch}
                        />

                        <button
                            type="submit"
                            className={`${styles.btnSubmit} ${styles.btnDrain}`}
                            disabled={drainSubmitting}
                        >
                            {drainSubmitting
                                ? 'Registering...'
                                : `Register ${drainDeviceId} → ${drainParentId}`}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className={styles.divider}>
                    <span className={styles.dividerDot} />
                    <span className={styles.dividerLine} />
                    <span className={styles.dividerDot} />
                </div>

                {/* RIGHT — Mesh Bucket */}
                <form className={`${styles.panel} ${styles.panelMesh}`} onSubmit={handleMeshSubmit}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelHeaderInner}>
                            <span className={styles.panelIcon}>🗑️</span>
                            <div>
                                <h2 className={styles.panelTitle}>Mesh Bucket</h2>
                                <p className={styles.panelSub}>Register Mesh Bucket sensor nodes</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.panelBody}>
                        {meshSuccess && (
                            <div className={styles.successBanner}>{meshSuccess}</div>
                        )}

                        <ParentSelector
                            type="mesh"
                            choice={meshParentChoice}
                            setChoice={setMeshParentChoice}
                            newName={meshNewName}
                            setNewName={setMeshNewName}
                            existingSystems={existingMeshSystems}
                            newId={nextMeshParentId}
                        />

                        <div className={styles.fieldGroup}>
                            <div className={styles.fieldGroupLabel}>🔌 Device Node (Sub)</div>
                            <div className={styles.inlineRow}>
                                <div className={styles.inlineField}>
                                    <label className={styles.label}>
                                        Device ID <span className={styles.autoTag}>Auto</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`${styles.input} ${styles.inputAuto}`}
                                        value={meshDeviceId}
                                        readOnly
                                    />
                                </div>
                                <div className={styles.inlineField}>
                                    <label className={styles.label}>Device Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="e.g. Overflow Sensor"
                                        value={meshDeviceName}
                                        onChange={e => setMeshDeviceName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <LocationPanel
                            location={meshLocation}
                            setLocation={setMeshLocation}
                            position={meshPosition}
                            setPosition={setMeshPosition}
                            search={meshSearch}
                            setSearch={setMeshSearch}
                        />

                        <button
                            type="submit"
                            className={`${styles.btnSubmit} ${styles.btnMesh}`}
                            disabled={meshSubmitting}
                        >
                            {meshSubmitting
                                ? 'Registering...'
                                : `Register ${meshDeviceId} → ${meshParentId}`}
                        </button>
                    </div>
                </form>
            </div>

            {/* ══ Registered list ══════════════════════════════════════════ */}
            <div className={styles.listWrapper}>
                <div className={styles.listHeadRow}>
                    <h3 className={styles.listHeading}>📋 Registered Devices</h3>
                    <span className={styles.listTotal}>
                        {registeredList.length} total
                    </span>
                </div>
                <div className={styles.listColumns}>
                    <RegisteredColumn
                        title="Drain Systems"
                        emoji="💧"
                        color={COL_BLUE}
                        groups={drainGroups}
                    />
                    <RegisteredColumn
                        title="Mesh Buckets"
                        emoji="🗑️"
                        color={COL_AMBER}
                        groups={meshGroups}
                    />
                </div>
            </div>


        </div>
    )
}
