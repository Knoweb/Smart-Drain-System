/**
 * useDrains — src/hooks/useDrains.ts
 * ---------------------------------------------------------------------------
 * Reads ALL sensor readings from Firebase RTDB and groups them by device_id
 * to produce a list of Drain objects with nested IoTDevice info.
 *
 * Firebase RTDB uses onValue() which fires immediately AND on every change,
 * giving us real-time updates for free (no polling needed).
 */

import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '@/lib/firebase'
import { toSensorReading, buildDrains } from '@/lib/firebaseData'
import type { Drain, SensorReading } from '@/types'

interface UseDrainsResult {
  drains: Drain[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDrains(): UseDrainsResult {
  const [drains, setDrains]   = useState<Drain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0) // increment to force re-subscribe

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Listen to the root of the database where all sensor readings live
    const dbRef = ref(db, '/sensor_logs')

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        try {
          const raw = snapshot.val()
          if (!raw) {
            setDrains([])
            setLoading(false)
            return
          }

          // Convert Firebase object → array of SensorReadings
          const readings: SensorReading[] = Object.entries(raw).map(([key, val]) =>
            toSensorReading(key, val as any)
          )

          setDrains(buildDrains(readings))
        } catch (e: any) {
          setError(e.message ?? 'Failed to parse database data')
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
  }, [tick])

  return {
    drains,
    loading,
    error,
    refetch: () => setTick(t => t + 1),
  }
}
