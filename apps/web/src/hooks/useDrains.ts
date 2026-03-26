/**
 * useDrains — src/hooks/useDrains.ts
 * ---------------------------------------------------------------------------
 * WHAT IS A CUSTOM HOOK?
 * A custom hook is a function that starts with "use" and encapsulates
 * data-fetching logic. Components that call this hook get back the data,
 * loading state, and any error — without caring HOW the data is fetched.
 *
 * WHY SEPARATE IT FROM THE COMPONENT?
 * - The DrainMap component stays clean — it only handles rendering.
 * - The same hook can be reused by DashboardPage, SensorsPage, etc.
 * - Easy to swap the data source later (e.g. add caching, or switch to REST).
 *
 * HOW IT WORKS:
 * On mount → calls Supabase → stores drains in state → returns to component.
 * Re-fetches automatically if the component re-mounts.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Drain } from '@/types'

interface UseDrainsResult {
    drains: Drain[]
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useDrains(): UseDrainsResult {
    const [drains, setDrains] = useState<Drain[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tick, setTick] = useState(0) // increment to trigger a refetch

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        supabase
            .from('drains')
            .select('*, iot_devices(*)')
            .order('name')
            .then(({ data, error: sbError }) => {
                if (cancelled) return
                if (sbError) {
                    setError(sbError.message)
                } else {
                    setDrains((data ?? []) as Drain[])
                }
                setLoading(false)
            })

        // Cleanup: if the component unmounts before the query finishes,
        // we don't want to call setState on an unmounted component.
        return () => { cancelled = true }
    }, [tick])

    return {
        drains,
        loading,
        error,
        refetch: () => setTick(t => t + 1),
    }
}
