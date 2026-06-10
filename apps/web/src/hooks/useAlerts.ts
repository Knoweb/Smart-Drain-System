/**
 * useAlerts — src/hooks/useAlerts.ts
 * ---------------------------------------------------------------------------
 * Derives alerts from Firebase RTDB sensor readings.
 * Unlike Supabase (which had a separate alerts table), Firebase stores only
 * raw readings, so we scan them and generate alerts client-side.
 *
 * Alert rules:
 *   HIGH_WATER_LEVEL  → water_level_pct >= 80
 *   LOW_BATTERY       → battery_level_pct < 20 (and not null)
 */

import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '@/lib/firebase'
import { toSensorReading, deviceLabel } from '@/lib/firebaseData'
import type { Alert, SensorReading } from '@/types'
import { ALERT_THRESHOLD_WATER_LEVEL, ALERT_THRESHOLD_BATTERY } from '@/config/constants'

/** Build alert objects from a reading that exceeds a threshold */
function generateAlerts(readings: SensorReading[]): Alert[] {
  const alerts: Alert[] = []

  // Group by sub_id (IoT device), pick the most recent reading per device
  const deviceLatest = new Map<string, SensorReading>()
  for (const r of readings) {
    const existing = deviceLatest.get(r.sub_id)
    if (!existing || r.recorded_at > existing.recorded_at) {
      deviceLatest.set(r.sub_id, r)
    }
  }

  deviceLatest.forEach((reading, subId) => {
    const drainName = deviceLabel(reading.device_id)
    const deviceName = subId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    if (reading.water_level_pct >= ALERT_THRESHOLD_WATER_LEVEL) {
      alerts.push({
        id:         `${reading.id}-water`,
        device_id:  reading.device_id, // Keep device_id so it links to the drain
        reading_id: reading.id,
        alert_type: 'HIGH_WATER_LEVEL',
        message:    `Water level at ${reading.water_level_pct.toFixed(0)}% — above threshold of ${ALERT_THRESHOLD_WATER_LEVEL}%`,
        is_resolved: false,
        created_at:  reading.recorded_at,
        iot_devices: { name: deviceName, drains: { name: drainName } },
      })
    }

    if (reading.battery_level_pct != null && reading.battery_level_pct < ALERT_THRESHOLD_BATTERY) {
      alerts.push({
        id:         `${reading.id}-battery`,
        device_id:  reading.device_id, // Keep device_id so it links to the drain
        reading_id: reading.id,
        alert_type: 'LOW_BATTERY',
        message:    `Battery at ${reading.battery_level_pct}% — below threshold of ${ALERT_THRESHOLD_BATTERY}%`,
        is_resolved: false,
        created_at:  reading.recorded_at,
        iot_devices: { name: deviceName, drains: { name: drainName } },
      })
    }
  })

  // Most-recent first
  return alerts.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function useAlerts() {
  const [allAlerts, setAllAlerts]   = useState<Alert[]>([])
  const [resolved, setResolved]     = useState<Set<string>>(new Set())
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const dbRef = ref(db, '/sensor_logs')

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        try {
          const raw = snapshot.val()
          if (!raw) {
            setAllAlerts([])
            setLoading(false)
            return
          }

          const readings: SensorReading[] = Object.entries(raw).map(([key, val]) =>
            toSensorReading(key, val as any)
          )

          setAllAlerts(generateAlerts(readings))
        } catch (e: any) {
          setError(e.message)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return () => off(dbRef, 'value', unsubscribe as any)
  }, [])

  // Mark an alert as resolved locally (Firebase has no alerts table to update)
  const resolveAlert = useCallback((id: string) => {
    setResolved(prev => new Set([...prev, id]))
  }, [])

  // Merge resolved state: unresolved first, resolved second
  const alerts = allAlerts
    .map(a => ({ ...a, is_resolved: resolved.has(a.id) }))
    .sort((a, b) => {
      if (a.is_resolved !== b.is_resolved) return a.is_resolved ? 1 : -1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return { alerts, loading, error, resolveAlert }
}

