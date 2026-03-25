/**
 * TYPE UPDATES — src/types/index.ts (Extension)
 * We add the `drains` relation to the `Alert` interface because we
 * query `.select('*, drains(name)')` so we can display the drain name.
 */

export type DrainStatus = 'OPERATIONAL' | 'WARNING' | 'CRITICAL'

export interface Drain {
    id: string
    name: string
    latitude: number
    longitude: number
    baseline_depth_cm: number | null
    status: DrainStatus
    created_at: string
}

export interface SensorReading {
    id: string
    drain_id: string
    water_level_pct: number
    water_pressure_psi: number | null
    temperature_c: number | null
    battery_level_pct: number | null
    recorded_at: string
}

export type AlertType = 'HIGH_WATER_LEVEL' | 'LOW_BATTERY' | 'SENSOR_OFFLINE'

export interface Alert {
    id: string
    drain_id: string
    reading_id: string | null
    alert_type: AlertType | string
    message: string | null
    is_resolved: boolean
    created_at: string

    // Joined relation when queried from Supabase:
    drains?: { name: string } | null
}
