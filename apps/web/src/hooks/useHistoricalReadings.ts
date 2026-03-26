import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { SensorReading } from '@/types'

export interface HistoricalReading extends SensorReading {
    drains?: { name: string } | null
}

export type TimeRange = '24h' | '7d' | 'all'

export function useHistoricalReadings(timeRange: TimeRange, drainId: string | 'all') {
    const [readings, setReadings] = useState<HistoricalReading[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        let query = supabase
            .from('sensor_readings')
            .select(`
                *,
                drains ( name )
            `)
            .order('recorded_at', { ascending: false })

        if (drainId !== 'all') {
            query = query.eq('drain_id', drainId)
        }

        if (timeRange === '24h') {
            const date = new Date()
            date.setHours(date.getHours() - 24)
            query = query.gte('recorded_at', date.toISOString())
        } else if (timeRange === '7d') {
            const date = new Date()
            date.setDate(date.getDate() - 7)
            query = query.gte('recorded_at', date.toISOString())
        }

        query.then(({ data, error: sbError }) => {
            if (cancelled) return
            if (sbError) setError(sbError.message)
            else setReadings((data as unknown as HistoricalReading[]) ?? [])
            setLoading(false)
        })

        return () => { cancelled = true }
    }, [timeRange, drainId])

    return { readings, loading, error }
}
