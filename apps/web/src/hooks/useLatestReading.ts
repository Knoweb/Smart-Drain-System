/**
 * useLatestReading — src/hooks/useLatestReading.ts
 * ---------------------------------------------------------------------------
 * Fetches the single most-recent sensor_reading row for a given drain.
 *
 * WHY PER-DRAIN (not fetch-all at once)?
 * The map popup calls this only when a user CLICKS a marker.
 * Fetching all readings for all drains at load time wastes bandwidth.
 * Instead, we lazy-load: "fetch when needed" pattern.
 *
 * We also subscribe to Supabase Realtime so when a new row is
 * inserted for this drain, the popup auto-updates — no polling needed.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { SensorReading } from '@/types'

interface UseLatestReadingResult {
    reading: SensorReading | null
    loading: boolean
    error: string | null
}

export function useLatestReading(drainId: string | null): UseLatestReadingResult {
    const [reading, setReading] = useState<SensorReading | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!drainId) {
            setReading(null)
            return
        }

        let cancelled = false
        setLoading(true)

        // ── 1. Initial fetch ───────────────────────────────────────────────────
        supabase
            .from('sensor_readings')
            .select('*')
            .eq('drain_id', drainId)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single()
            .then(({ data, error: sbError }) => {
                if (cancelled) return
                if (sbError && sbError.code !== 'PGRST116') {
                    // PGRST116 = no rows found (not a real error)
                    setError(sbError.message)
                } else {
                    setReading(data as SensorReading ?? null)
                }
                setLoading(false)
            })

        // ── 2. Realtime subscription: listen for new readings ─────────────────
        // When a new row is INSERTed for this drain, update the displayed reading.
        const channel = supabase
            .channel(`readings-${drainId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'sensor_readings',
                    filter: `drain_id=eq.${drainId}`,
                },
                (payload) => {
                    if (!cancelled) {
                        setReading(payload.new as SensorReading)
                    }
                }
            )
            .subscribe()

        return () => {
            cancelled = true
            supabase.removeChannel(channel)
        }
    }, [drainId])

    return { reading, loading, error }
}
