/**
 * firebaseData.ts — src/lib/firebaseData.ts
 * ---------------------------------------------------------------------------
 * Shared helpers for reading from Firebase Realtime Database.
 *
 * DATA STRUCTURE in Firebase RTDB (root level):
 *   /{push-key}/
 *     battery_level_pct : number
 *     device_id         : string   e.g. "smart_drain_01"
 *     temperature_c     : number
 *     timestamp         : number   (Unix ms)
 *     water_level_pct   : number
 *     water_pressure_psi: number
 *
 * DEVICE COORDINATES — Firebase RTDB has no location data, so we keep a
 * static map here. Add / update entries as you add more physical devices.
 */

import type { FirebaseReading, SensorReading, Drain, IoTDevice, DrainStatus } from '@/types'

// ── Static device metadata ────────────────────────────────────────────────────
// Add the GPS coordinates and friendly name for each device_id here.
export const DEVICE_META: Record<string, { name: string; lat: number; lng: number }> = {
  smart_drain_01: { name: 'Smart Drain 01', lat: 6.9271, lng: 79.8612 },
  // Add more devices here as your hardware expands:
  // smart_drain_02: { name: 'Smart Drain 02', lat: 6.9300, lng: 79.8650 },
}

/** Format a device_id slug into a human label */
export function deviceLabel(deviceId: string): string {
  return DEVICE_META[deviceId]?.name
    ?? deviceId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** Convert a raw Firebase entry into a normalised SensorReading */
export function toSensorReading(key: string, raw: Omit<FirebaseReading, 'key'>): SensorReading {
  return {
    id:                key,
    device_id:         raw.device_id ?? 'unknown',
    water_level_pct:   raw.water_level_pct   ?? 0,
    water_pressure_psi: raw.water_pressure_psi != null ? raw.water_pressure_psi : null,
    temperature_c:     raw.temperature_c     != null ? raw.temperature_c     : null,
    battery_level_pct: raw.battery_level_pct != null ? raw.battery_level_pct : null,
    recorded_at:       new Date(raw.timestamp ?? Date.now()).toISOString(),
  }
}

/** Derive DrainStatus from the latest water level and battery readings */
export function deriveStatus(waterLevel: number, battery: number | null): DrainStatus {
  if (waterLevel >= 80) return 'CRITICAL'
  if (waterLevel >= 60) return 'WARNING'
  if (battery != null && battery < 20) return 'WARNING'
  return 'OPERATIONAL'
}

/**
 * Given all readings, build a list of Drain objects grouped by device_id.
 * Each unique device_id becomes one Drain with one IoTDevice.
 */
export function buildDrains(readings: SensorReading[]): Drain[] {
  // Group readings by device_id
  const deviceMap = new Map<string, SensorReading[]>()
  for (const r of readings) {
    const arr = deviceMap.get(r.device_id) ?? []
    arr.push(r)
    deviceMap.set(r.device_id, arr)
  }

  const drains: Drain[] = []

  deviceMap.forEach((deviceReadings, deviceId) => {
    // Use the most-recent reading for status calculation
    const latest = deviceReadings.reduce(
      (best, r) => new Date(r.recorded_at) > new Date(best.recorded_at) ? r : best
    )

    const meta   = DEVICE_META[deviceId]
    const status = deriveStatus(latest.water_level_pct, latest.battery_level_pct)
    const name   = deviceLabel(deviceId)

    const device: IoTDevice = {
      id:        deviceId,
      drain_id:  deviceId,
      name,
      latitude:  meta?.lat ?? 6.9271,
      longitude: meta?.lng ?? 79.8612,
      status,
      created_at: latest.recorded_at,
    }

    drains.push({
      id:                deviceId,
      name,
      latitude:          meta?.lat ?? 6.9271,
      longitude:         meta?.lng ?? 79.8612,
      baseline_depth_cm: null,
      status,
      created_at:        latest.recorded_at,
      iot_devices:       [device],
    })
  })

  return drains.sort((a, b) => a.name.localeCompare(b.name))
}
