/**
 * TYPE DEFINITIONS — src/types/index.ts
 * ---------------------------------------------------------------------------
 * Updated to reflect Firebase Realtime Database data structure.
 *
 * Firebase RTDB structure:
 *   /{auto-key}/
 *     battery_level_pct: number
 *     device_id: string       e.g. "smart_drain_01"
 *     temperature_c: number
 *     timestamp: number       Unix milliseconds
 *     water_level_pct: number
 *     water_pressure_psi: number
 */

export type DrainStatus = 'OPERATIONAL' | 'WARNING' | 'CRITICAL'

/** A single raw record as stored in Firebase RTDB */
export interface FirebaseReading {
  key:               string   // Firebase push-key (auto-id)
  device_id:         string   // Maps to Drain ID (e.g. "Smart_Drain_01")
  sub_id?:           string   // Maps to IoT Device ID (e.g. "Device-01")
  water_level_pct:   number
  water_pressure_psi: number
  temperature_c:     number
  battery_level_pct: number
  timestamp:         number   // Unix milliseconds
  latitude?:         number
  longitude?:        number
}

/**
 * SensorReading — normalised view used throughout the app.
 * Maps Firebase fields to the same shape the UI already expects.
 */
export interface SensorReading {
  id:                string    // Firebase push-key used as row id
  device_id:         string    // The drain ID
  sub_id:            string    // The specific IoT device ID
  water_level_pct:   number
  water_pressure_psi: number | null
  temperature_c:     number | null
  battery_level_pct: number | null
  recorded_at:       string   // ISO string derived from timestamp
  latitude:          number | null
  longitude:         number | null
}

/** Derived from grouping readings by device_id */
export interface IoTDevice {
  id:        string   // Maps to sub_id
  drain_id:  string   // Maps to device_id
  name:      string   // human-friendly label
  latitude:  number
  longitude: number
  status:    DrainStatus
  created_at: string
}

/** Drain = one logical monitoring site = one device in this Firebase setup */
export interface Drain {
  id:                string
  name:              string
  latitude:          number
  longitude:         number
  baseline_depth_cm: number | null
  status:            DrainStatus
  created_at:        string

  // Each drain has exactly one IoT device in this setup
  iot_devices?: IoTDevice[]
}

export type AlertType = 'HIGH_WATER_LEVEL' | 'LOW_BATTERY' | 'SENSOR_OFFLINE'

/** Alert derived from sensor readings (not stored separately in Firebase) */
export interface Alert {
  id:          string
  device_id:   string
  reading_id:  string | null
  alert_type:  AlertType | string
  message:     string | null
  is_resolved: boolean
  created_at:  string

  // For display purposes
  iot_devices?: { name: string; drains?: { name: string } } | null
}
