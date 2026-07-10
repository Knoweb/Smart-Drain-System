import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '@/lib/firebase'

export interface SmsContact {
    name: string;
    phone: string;
    type: string;
}

export interface AppSettings {
    thresholds: {
        water_warning: number
        water_critical: number
        mesh_warning: number
        battery_low: number
    }
    notifications: {
        sms_contacts: SmsContact[]
        whatsapp_group_enabled: boolean
        whatsapp_group_id: string
    }
}

export const DEFAULT_SETTINGS: AppSettings = {
    thresholds: {
        water_warning: 70,
        water_critical: 85,
        mesh_warning: 70,
        battery_low: 20
    },
    notifications: {
        sms_contacts: [
            { name: 'Saranga- Tractor Driver', phone: '0756595962', type: 'Bin fill levels only' },
            { name: 'Balasooriya- Tractor Driver', phone: '0772057474', type: 'Bin fill levels only' },
            { name: 'Ruwan-Technical Officer, Kolonnawa UC', phone: '0766308318', type: 'Bin fill levels and Water flow levels' },
            { name: 'Susil, member- Kolonnawa UC', phone: '0765364495', type: 'Bin fill levels and Water flow levels' },
            { name: 'Chanaka Mahabandara, PHI- Kolonnawa UC', phone: '0716295127', type: 'Bin fill levels and Water flow levels' },
            { name: 'Priyanga-Director Atomic Energy Board', phone: '0763719770', type: "Water flow levels, if there's an emergency" },
        ],
        whatsapp_group_enabled: false,
        whatsapp_group_id: ''
    }
}

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

    useEffect(() => {
        const settingsRef = ref(db, 'settings')
        const unsubscribe = onValue(settingsRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                setSettings({
                    thresholds: { ...DEFAULT_SETTINGS.thresholds, ...(data.thresholds || {}) },
                    notifications: { ...DEFAULT_SETTINGS.notifications, ...(data.notifications || {}) }
                })
            }
        })
        return () => unsubscribe()
    }, [])

    return settings
}
