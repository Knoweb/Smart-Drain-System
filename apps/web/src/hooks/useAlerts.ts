/**
 * useAlerts — src/hooks/useAlerts.ts
 * ---------------------------------------------------------------------------
 * Fetches alerts and joins the drain name using Supabase foreign keys.
 * Includes a function to mark an alert as resolved.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Alert } from '@/types'

export function useAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tick, setTick] = useState(0) // increment to refetch

    useEffect(() => {
        let cancelled = false
        setLoading(true)

        // Using Supabase relation query: '*, drains(name)'
        // This tells PostgREST to follow the drain_id foreign key and fetch the name.
        supabase
            .from('alerts')
            .select(`
        *,
        drains ( name )
      `)
            .order('is_resolved', { ascending: true }) // Unresolved first
            .order('created_at', { ascending: false }) // Newest first
            .then(({ data, error: sbError }) => {
                if (cancelled) return
                if (sbError) setError(sbError.message)
                else setAlerts((data as unknown as Alert[]) ?? [])
                setLoading(false)
            })

        return () => { cancelled = true }
    }, [tick])

    const resolveAlert = async (id: string) => {
        const { error } = await supabase
            .from('alerts')
            .update({ is_resolved: true })
            .eq('id', id)

        if (error) {
            alert(`Failed to resolve: ${error.message}`)
        } else {
            setTick(t => t + 1) // Refetch the list to update UI
        }
    }

    return { alerts, loading, error, resolveAlert }
}
