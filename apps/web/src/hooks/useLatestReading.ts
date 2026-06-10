/**
 * useLatestReading — src/hooks/useLatestReading.ts
 * ---------------------------------------------------------------------------
 * Returns the single most-recent sensor reading for a given device_id.
 *
 * Firebase RTDB: queries the root, filters by device_id, sorts by timestamp,
 * takes the last entry. Uses onValue for real-time updates.
 */

import { useState, useEffect } from 'react'
import { ref, query, orderByChild, equalTo, limitToLast, onValue, off } from 'firebase/database'
import { db } from '@/lib/firebase'
import { toSensorReading } from '@/lib/firebaseData'
import type { SensorReading } from '@/types'

interface UseLatestReadingResult {
  reading: SensorReading | null
  loading: boolean
  error: string | null
}

export function useLatestReading(deviceId: string | null): UseLatestReadingResult {
  const [reading, setReading] = useState<SensorReading | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!deviceId) {
      setReading(null)
      return
    }

    setLoading(true)

    // Query: filter by device_id, order by timestamp, take last 1
    const dbRef = query(
      ref(db, '/sensor_logs'),
      orderByChild('device_id'),
      equalTo(deviceId),
    )

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        try {
          const raw = snapshot.val()
          if (!raw) {
            setReading(null)
            setLoading(false)
            return
          }

          // Convert to array and find the one with the highest timestamp
          const entries = Object.entries(raw).map(([key, val]) =>
            toSensorReading(key, val as any)
          )

          const latest = entries.reduce(
            (best, r) => r.recorded_at > best.recorded_at ? r : best
          )

          setReading(latest)
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
  }, [deviceId])

  return { reading, loading, error }
}

