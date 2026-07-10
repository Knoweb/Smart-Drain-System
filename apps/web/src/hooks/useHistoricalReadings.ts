/**
 * useHistoricalReadings — src/hooks/useHistoricalReadings.ts
 * ---------------------------------------------------------------------------
 * Fetches all readings from Firebase RTDB, optionally filtered by:
 *   - timeRange: '24h' | '7d' | 'all'
 *   - deviceId : specific device_id string, or 'all'
 *
 * Readings are returned newest-first (consistent with the old Supabase hook).
 * The HistoricalReading type adds a drains field for backwards-compatibility
 * with the ReportsPage and WaterLevelTrendChart components.
 */

import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '@/lib/firebase'
import { toSensorReading, deviceLabel } from '@/lib/firebaseData'
import type { SensorReading } from '@/types'

export interface HistoricalReading extends SensorReading {
  /** Shim for backwards-compat with ReportsPage / WaterLevelTrendChart */
  iot_devices?: { name: string; drains?: { name: string } } | null
}

export type TimeRange = '24h' | '7d' | 'all'

export function useHistoricalReadings(timeRange: TimeRange, deviceId: string | 'all') {
  const [readings, setReadings] = useState<HistoricalReading[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const dbRef = ref(db, '/sensor_logs')

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        try {
          const raw = snapshot.val()
          if (!raw) {
            setReadings([])
            setLoading(false)
            return
          }

          let entries: HistoricalReading[] = Object.entries(raw).map(([key, val]) => {
            const base = toSensorReading(key, val as any)
            const drainName = deviceLabel(base.device_id)
            const deviceName = base.sub_id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            return {
              ...base,
              iot_devices: {
                name: deviceName,
                drains: { name: drainName },
              },
            }
          })

          // ── Filter by deviceId ──────────────────────────────────────────
          if (deviceId !== 'all') {
            entries = entries.filter(r => r.device_id === deviceId || r.sub_id === deviceId)
          }

          // ── Filter by time range ────────────────────────────────────────
          if (timeRange === '24h') {
            const cutoff = Date.now() - 24 * 60 * 60 * 1000
            entries = entries.filter(r => new Date(r.recorded_at).getTime() >= cutoff)
          } else if (timeRange === '7d') {
            const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
            entries = entries.filter(r => new Date(r.recorded_at).getTime() >= cutoff)
          }

          // Newest first (consistent with Supabase .order('recorded_at', {ascending:false}))
          entries.sort(
            (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
          )

          setReadings(entries)
        } catch (e: any) {
          setError(e.message ?? 'Failed to parse readings')
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
  }, [timeRange, deviceId])

  return { readings, loading, error }
}

