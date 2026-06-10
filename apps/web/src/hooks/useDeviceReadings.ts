/**
 * useDeviceReadings — src/hooks/useDeviceReadings.ts
 * ---------------------------------------------------------------------------
 * Fetches the last N sensor readings for a specific device_id.
 * Used by SensorCard to render a sparkline trend chart.
 *
 * Reads from Firebase RTDB, filters by device_id client-side,
 * returns readings sorted oldest→newest so the sparkline goes left→right.
 */

import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '@/lib/firebase'
import { toSensorReading } from '@/lib/firebaseData'
import type { SensorReading } from '@/types'

export function useDeviceReadings(subId: string | null, limit = 20) {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!subId) {
      setReadings([])
      return
    }

    setLoading(true)

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

          const entries: SensorReading[] = Object.entries(raw)
            .map(([key, val]) => toSensorReading(key, val as any))
            .filter(r => r.sub_id === subId)
            // Sort newest first, then take the `limit` most recent
            .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
            .slice(0, limit)
            // Reverse so sparkline goes oldest → newest (left → right)
            .reverse()

          setReadings(entries)
        } catch {
          setReadings([])
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLoading(false)
      }
    )

    return () => off(dbRef, 'value', unsubscribe as any)
  }, [subId, limit])

  return { readings, loading }
}

