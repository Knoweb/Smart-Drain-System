/**
 * firebaseData.ts — src/lib/firebaseData.ts
 * ---------------------------------------------------------------------------
 * Shared helpers for reading from Firebase Realtime Database.
 *
 * DATA STRUCTURE in Firebase RTDB (root level — /sensor_logs):
 *   /{push-key}/
 *     device_id:          string   e.g. "smart_drain_01"
 *     sub_id:             string   e.g. "device_01" or "mesh_bucket_01"
 *     device_type:        string   "drain_sensor" | "mesh_bucket"
 *     battery_level_pct:  number
 *     temperature_c:      number   (drain sensors only)
 *     timestamp:          number   (Unix ms)
 *     water_level_pct:    number   (drain sensors only)
 *     water_pressure_psi: number   (drain sensors only)
 *     mesh_level_pct:     number   (mesh buckets only — garbage fill %)
 *
 * NOTE: If device_type is absent, it defaults to 'drain_sensor'.
 * Mesh buckets are identified by sub_id starting with "mesh_bucket" OR device_type == "mesh_bucket".
 */

import type {
  FirebaseReading, SensorReading, Drain, IoTDevice, MeshBucket, DrainStatus, DeviceType
} from '@/types'

// ── Static device metadata ────────────────────────────────────────────────────
// Add the GPS coordinates and friendly name for each device_id here.
export const DEVICE_META: Record<string, { name: string; location_name: string; lat: number; lng: number }> = {
  smart_drain_01: { name: 'Smart Drain 01', location_name: 'Orugodawatte, Sri Lanka', lat: 6.949825, lng: 79.880478 },
  mesh_bucket_01: { name: 'Mesh Bucket 01', location_name: 'Orugodawatte, Sri Lanka', lat: 6.949825, lng: 79.880478 },
}

/** Format a device_id slug into a human label */
export function deviceLabel(deviceId: string): string {
  return DEVICE_META[deviceId]?.name
    ?? deviceId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** Map generic sensor IDs to descriptive names */
function formatSensorName(subId: string, deviceType: DeviceType): string {
  if (subId.toLowerCase() === 'device-01' || subId.toLowerCase() === 'device_01') return 'Main Water Level Sensor';
  if (subId.toLowerCase() === 'mesh_bucket_01') return 'Mesh Bucket 01';

  return subId.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Determine if a sub_id refers to a mesh bucket */
function inferDeviceType(raw: Omit<FirebaseReading, 'key'>): DeviceType {
  if (raw.device_type === 'mesh_bucket') return 'mesh_bucket'
  if (raw.sub_id && raw.sub_id.toLowerCase().includes('mesh_bucket')) return 'mesh_bucket'
  if (raw.sub_id && raw.sub_id.toLowerCase().includes('mesh')) return 'mesh_bucket'
  return 'drain_sensor'
}

export function toSensorReading(key: string, raw: Omit<FirebaseReading, 'key'>): SensorReading {
  let deviceId = raw.device_id ?? 'unknown';
  let subId = raw.sub_id ?? 'unknown_device';

  // HARDWARE MISTAKE FIX: Hardware sent the different devices as completely separate systems (device_id)
  // We force them to be grouped under a single 'orugodawatte_drain_system' 
  // and make their original device_id the sub_id so they appear correctly.
  if (deviceId !== 'unknown' && deviceId !== 'orugodawatte_drain_system') {
    subId = deviceId;
    deviceId = 'orugodawatte_drain_system';
  }

  // Normalize subId consistently to fix hardware reporting differences (e.g. spaces vs underscores)
  subId = subId.trim().toLowerCase().replace(/[-\s]+/g, '_');

  // Determine type AFTER the hardware fix, since subId might have changed to "Mesh Bucket 01"
  let device_type: DeviceType = 'drain_sensor';
  if (raw.device_type === 'mesh_bucket' || subId.toLowerCase().includes('mesh')) {
    device_type = 'mesh_bucket';
  }

  return {
    id: key,
    device_id: deviceId,
    sub_id: subId,
    device_type,
    water_level_pct: raw.water_level_pct ?? 0,
    water_pressure_psi: raw.water_pressure_psi != null ? raw.water_pressure_psi : null,
    temperature_c: raw.temperature_c != null ? raw.temperature_c : null,
    battery_level_pct: raw.battery_level_pct != null ? raw.battery_level_pct : null,
    mesh_level_pct: raw.mesh_level_pct != null ? raw.mesh_level_pct : null,
    recorded_at: new Date(raw.timestamp ?? Date.now()).toISOString(),
    latitude: raw.latitude != null ? raw.latitude : null,
    longitude: raw.longitude != null ? raw.longitude : null,
  }
}

/** Derive DrainStatus from the latest water level / mesh level and battery */
export function deriveStatus(
  level: number,
  battery: number | null,
  deviceType: DeviceType,
  thresholds: { water_warning: number, water_critical: number, mesh_warning: number, battery_low: number }
): DrainStatus {
  if (deviceType === 'drain_sensor') {
    if (level >= thresholds.water_critical) return 'CRITICAL'
    if (level >= thresholds.water_warning) return 'WARNING'
  } else if (deviceType === 'mesh_bucket') {
    // Mesh buckets only have a warning threshold for now
    if (level >= thresholds.mesh_warning) return 'WARNING'
  }

  if (battery != null && battery < thresholds.battery_low) return 'WARNING'

  return 'OPERATIONAL'
}

/**
 * Given all readings, build a list of Drain objects grouped by device_id.
 * Each drain gets:
 *   - iot_devices: drain sensor sub-devices
 *   - mesh_buckets: mesh bucket sub-devices
 */
export function buildDrains(
  readings: SensorReading[],
  thresholds: { water_warning: number, water_critical: number, mesh_warning: number, battery_low: number }
): Drain[] {
  // Group readings by device_id (drain)
  const deviceMap = new Map<string, SensorReading[]>()
  for (const r of readings) {
    const arr = deviceMap.get(r.device_id) ?? []
    arr.push(r)
    deviceMap.set(r.device_id, arr)
  }

  const drains: Drain[] = []

  deviceMap.forEach((drainReadings, deviceId) => {
    // Split into drain sensors vs mesh buckets
    const sensorReadings = drainReadings.filter(r => r.device_type === 'drain_sensor')
    const meshReadings = drainReadings.filter(r => r.device_type === 'mesh_bucket')

    // --- Build IoT Devices (drain sensors) ---
    const sensorSubDeviceMap = new Map<string, SensorReading[]>()
    for (const r of sensorReadings) {
      const arr = sensorSubDeviceMap.get(r.sub_id) ?? []
      arr.push(r)
      sensorSubDeviceMap.set(r.sub_id, arr)
    }

    const iotDevices: IoTDevice[] = []
    sensorSubDeviceMap.forEach((deviceReadings, subId) => {
      const latestDeviceReading = deviceReadings.reduce(
        (best, r) => new Date(r.recorded_at) > new Date(best.recorded_at) ? r : best
      )
      const status = deriveStatus(latestDeviceReading.water_level_pct, latestDeviceReading.battery_level_pct, 'drain_sensor', thresholds)
      iotDevices.push({
        id: subId,
        drain_id: deviceId,
        name: formatSensorName(subId, 'drain_sensor'),
        device_type: 'drain_sensor',
        latitude: latestDeviceReading.latitude ?? DEVICE_META[deviceId]?.lat ?? 6.949825,
        longitude: latestDeviceReading.longitude ?? DEVICE_META[deviceId]?.lng ?? 79.880478,
        status,
        created_at: latestDeviceReading.recorded_at,
      })
    })

    // --- Build Mesh Buckets ---
    const meshSubDeviceMap = new Map<string, SensorReading[]>()
    for (const r of meshReadings) {
      const arr = meshSubDeviceMap.get(r.sub_id) ?? []
      arr.push(r)
      meshSubDeviceMap.set(r.sub_id, arr)
    }

    const meshBuckets: MeshBucket[] = []
    meshSubDeviceMap.forEach((meshDeviceReadings, subId) => {
      const latestMeshReading = meshDeviceReadings.reduce(
        (best, r) => new Date(r.recorded_at) > new Date(best.recorded_at) ? r : best
      )
      const meshLevel = latestMeshReading.mesh_level_pct ?? 0
      const status = deriveStatus(meshLevel, latestMeshReading.battery_level_pct, 'mesh_bucket', thresholds)
      meshBuckets.push({
        id: subId,
        drain_id: deviceId,
        name: formatSensorName(subId, 'mesh_bucket'),
        mesh_level_pct: meshLevel,
        battery_level_pct: latestMeshReading.battery_level_pct,
        latitude: latestMeshReading.latitude ?? DEVICE_META[deviceId]?.lat ?? 6.949825,
        longitude: latestMeshReading.longitude ?? DEVICE_META[deviceId]?.lng ?? 79.880478,
        status,
        recorded_at: latestMeshReading.recorded_at,
      })
    })

    // For the overall drain status, use the latest reading across ALL sub-devices
    const latestDrainReading = drainReadings.reduce(
      (best, r) => new Date(r.recorded_at) > new Date(best.recorded_at) ? r : best
    )

    const meta = DEVICE_META[deviceId]
    const status = deriveStatus(
      latestDrainReading.device_type === 'mesh_bucket' ? (latestDrainReading.mesh_level_pct ?? 0) : latestDrainReading.water_level_pct,
      latestDrainReading.battery_level_pct,
      latestDrainReading.device_type,
      thresholds
    )
    const name = deviceLabel(deviceId)

    // Get the latest water level from drain sensors only
    const latestWaterReading = sensorReadings.length > 0
      ? sensorReadings.reduce((best, r) => new Date(r.recorded_at) > new Date(best.recorded_at) ? r : best)
      : null

    drains.push({
      id: deviceId,
      name,
      location_name: meta?.location_name ?? 'Unknown Location',
      latitude: latestDrainReading.latitude ?? meta?.lat ?? 6.949825,
      longitude: latestDrainReading.longitude ?? meta?.lng ?? 79.880478,
      baseline_depth_cm: null,
      status,
      water_level_pct: latestWaterReading?.water_level_pct ?? 0,
      created_at: latestDrainReading.recorded_at,
      iot_devices: iotDevices.sort((a, b) => a.name.localeCompare(b.name)),
      mesh_buckets: meshBuckets.sort((a, b) => a.name.localeCompare(b.name)),
    })
  })

  return drains.sort((a, b) => a.name.localeCompare(b.name))
}
