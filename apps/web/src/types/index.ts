/**
 * TYPE DEFINITIONS — src/types/index.ts
 * ---------------------------------------------------------------------------
 * Updated to support both Drain Sensors and Mesh Bucket sensors.
 *
 * Firebase RTDB structure — Drain Sensor:
 *   /{auto-key}/
 *     device_id:         string   e.g. "smart_drain_01"
 *     sub_id:            string   e.g. "device_01"
 *     device_type:       "drain_sensor"  (or absent = drain sensor)
 *     water_level_pct:   number
 *     water_pressure_psi:number
 *     temperature_c:     number
 *     battery_level_pct: number
 *     timestamp:         number   Unix milliseconds
 *
 * Firebase RTDB structure — Mesh Bucket Sensor:
 *   /{auto-key}/
 *     device_id:         string   e.g. "smart_drain_01"
 *     sub_id:            string   e.g. "mesh_bucket_01"
 *     device_type:       "mesh_bucket"
 *     mesh_level_pct:    number   (garbage/trash fill level)
 *     battery_level_pct: number
 *     timestamp:         number   Unix milliseconds
 */

export type DrainStatus = 'OPERATIONAL' | 'WARNING' | 'CRITICAL'
export type DeviceType = 'drain_sensor' | 'mesh_bucket'

/** A single raw record as stored in Firebase RTDB */
export interface FirebaseReading {
  key:                string   // Firebase push-key (auto-id)
  device_id:          string   // Maps to Drain ID (e.g. "smart_drain_01")
  sub_id?:            string   // Maps to IoT Device ID (e.g. "device_01")
  device_type?:       DeviceType  // 'drain_sensor' | 'mesh_bucket'
  water_level_pct:    number
  water_pressure_psi: number
  temperature_c:      number
  battery_level_pct:  number
  mesh_level_pct?:    number   // Garbage/trash fill % — only for mesh_bucket type
  timestamp:          number   // Unix milliseconds
  latitude?:          number
  longitude?:         number
}

/**
 * SensorReading — normalised view used throughout the app.
 * Maps Firebase fields to the same shape the UI already expects.
 */
export interface SensorReading {
  id:                 string    // Firebase push-key used as row id
  device_id:          string    // The drain ID
  sub_id:             string    // The specific IoT device ID
  device_type:        DeviceType // drain_sensor or mesh_bucket
  water_level_pct:    number
  water_pressure_psi: number | null
  temperature_c:      number | null
  battery_level_pct:  number | null
  mesh_level_pct:     number | null  // null for drain sensors
  recorded_at:        string    // ISO string derived from timestamp
  latitude:           number | null
  longitude:          number | null
}

/** Derived from grouping readings by device_id */
export interface IoTDevice {
  id:          string   // Maps to sub_id
  drain_id:    string   // Maps to device_id
  name:        string   // human-friendly label
  device_type: DeviceType
  latitude:    number
  longitude:   number
  status:      DrainStatus
  created_at:  string
}

/** Mesh Bucket — a filtration basket inside the drain that collects garbage */
export interface MeshBucket {
  id:               string     // sub_id e.g. "mesh_bucket_01"
  drain_id:         string     // which drain this bucket belongs to
  name:             string     // e.g. "Mesh Bucket 01"
  mesh_level_pct:   number     // current garbage fill percentage
  battery_level_pct: number | null
  latitude:         number
  longitude:        number
  status:           DrainStatus
  recorded_at:      string
}

/** Drain = one logical monitoring site = one device in this Firebase setup */
export interface Drain {
  id:                string
  name:              string
  location_name?:    string
  latitude:          number
  longitude:         number
  baseline_depth_cm: number | null
  status:            DrainStatus
  water_level_pct:   number    // latest water level for quick display
  created_at:        string

  // Each drain can have multiple IoT sensor devices and mesh buckets
  iot_devices?:   IoTDevice[]
  mesh_buckets?:  MeshBucket[]
}

export type AlertType = 'HIGH_WATER_LEVEL' | 'LOW_BATTERY' | 'SENSOR_OFFLINE' | 'HIGH_MESH_LEVEL'

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
  iot_devices?: { name: string; drains?: { name: string }; device_type?: DeviceType } | null
}

/** Device registration record (stored in Firebase under /registered_devices) */
export interface RegisteredDevice {
  id:          string
  drain_id:    string   // which drain this belongs to
  drain_name:  string
  device_name: string   // e.g. "Device 01"
  device_type: DeviceType
  location:    string   // human-readable location description
  latitude:    number
  longitude:   number
  registered_at: string
}
