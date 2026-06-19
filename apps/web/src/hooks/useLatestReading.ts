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

export function useLatestReading(subId: string | null): UseLatestReadingResult {
  const [reading, setReading] = useState<SensorReading | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!subId) {
      setReading(null)
      return
    }

    setLoading(true)

    // To support hardware that lacks a sub_id field in Firebase,
    // we fetch and filter client-side using toSensorReading's fallback values.
    const dbRef = ref(db, '/sensor_logs')

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

          let latest: SensorReading | null = null

          for (const key in raw) {
            const r = toSensorReading(key, raw[key] as any)
            if (r.sub_id === subId) {
              if (!latest || r.recorded_at > latest.recorded_at) {
                latest = r
              }
            }
          }

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
  }, [subId])

  return { reading, loading, error }
}

