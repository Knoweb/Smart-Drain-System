/**
 * useDeviceReadings — src/hooks/useDeviceReadings.ts
 * ---------------------------------------------------------------------------
 * Fetches the last N sensor readings for a specific IoT device.
 * Used by SensorCard to render a sparkline trend chart.
 *
 * Unlike useLatestReading (real-time single row), this is a one-time fetch
 * of historical sparkline data — no Realtime subscription needed.
 * Re-fetches whenever deviceId changes.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { SensorReading } from '@/types'

export function useDeviceReadings(deviceId: string | null, limit = 20) {
    const [readings, setReadings] = useState<SensorReading[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!deviceId) {
            setReadings([])
            return
        }

        let cancelled = false
        setLoading(true)

        supabase
            .from('sensor_readings')
            .select('id, device_id, water_level_pct, recorded_at')
            .eq('device_id', deviceId)
            .order('recorded_at', { ascending: false })
            .limit(limit)
            .then(({ data }) => {
                if (cancelled) return
                // Reverse so the sparkline goes oldest → newest (left → right)
                setReadings(((data ?? []) as SensorReading[]).reverse())
                setLoading(false)
            })

        return () => { cancelled = true }
    }, [deviceId, limit])

    return { readings, loading }
}
