import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '@/lib/firebase'
import styles from './SettingsPage.module.css'
import pageStyles from './Page.module.css'
import { useTheme } from '@/contexts/ThemeContext'

export interface SmsContact {
    name: string;
    phone: string;
    type: string;
}

export interface DeviceConfig {
    deviceId: string;
    subId?: string;
    stored_numbers: string;
}

interface AppSettings {
    thresholds: {
        water_warning: number
        water_critical: number
        mesh_warning: number
        battery_low: number
        stored_numbers?: string
        [key: string]: any // To allow nested device configs
    }
    notifications: {
        sms_contacts: SmsContact[]
        whatsapp_group_enabled: boolean
        whatsapp_group_id: string
    }
}

const DEFAULT_SETTINGS: AppSettings = {
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

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme()
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
    const [deviceConfigs, setDeviceConfigs] = useState<DeviceConfig[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const settingsRef = ref(db, 'settings')
        const unsubscribe = onValue(settingsRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                // Ensure arrays are initialized if missing
                if (!data.notifications) data.notifications = DEFAULT_SETTINGS.notifications
                if (!data.notifications.sms_contacts) data.notifications.sms_contacts = []
                if (data.notifications.sms_contacts.length === 0) data.notifications.sms_contacts = [{ name: '', phone: '', type: '' }]

                // Backwards compatibility with previous string array
                data.notifications.sms_contacts = data.notifications.sms_contacts.map((c: any) => {
                    if (typeof c === 'string') return { name: '', phone: c, type: '' }
                    return c
                })

                // Parse device configs directly from thresholds node
                const loadedDeviceConfigs: DeviceConfig[] = [];
                if (data.thresholds) {
                    Object.keys(data.thresholds).forEach(deviceId => {
                        const deviceNode = data.thresholds[deviceId];
                        // Ignore global scalar thresholds (battery_low, mesh_warning, etc.)
                        if (typeof deviceNode === 'object' && deviceNode !== null) {
                            if (deviceNode.stored_numbers !== undefined) {
                                loadedDeviceConfigs.push({
                                    deviceId: deviceId.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                                    stored_numbers: deviceNode.stored_numbers
                                });
                            } else {
                                // If stored_numbers is nested inside a push ID due to previous bad save, read it and flatten it
                                Object.keys(deviceNode).forEach(subId => {
                                    if (deviceNode[subId] && deviceNode[subId].stored_numbers !== undefined) {
                                        loadedDeviceConfigs.push({
                                            deviceId: deviceId.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                                            stored_numbers: deviceNode[subId].stored_numbers
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
                
                // Ensure default devices exist if missing
                const defaultDevices = ['Mesh Bucket 01', 'Smart Drain 01'];
                defaultDevices.forEach(name => {
                    if (!loadedDeviceConfigs.find(c => c.deviceId === name || c.deviceId.toLowerCase().replace(/[-_]/g, ' ') === name.toLowerCase())) {
                        loadedDeviceConfigs.push({ deviceId: name, stored_numbers: '' });
                    }
                });

                // Remove exact duplicate device IDs just in case
                const uniqueConfigs = Array.from(new Map(loadedDeviceConfigs.map(c => [c.deviceId, c])).values());
                
                setDeviceConfigs(uniqueConfigs);

                setSettings(data)
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setMessage('')
        try {
            // Build final thresholds object (keep global ones, rebuild nested ones)
            const finalThresholds = { ...settings.thresholds };
            // Clear existing objects to rebuild
            Object.keys(finalThresholds).forEach(k => {
                if (typeof finalThresholds[k] === 'object') delete finalThresholds[k];
            });

            deviceConfigs.forEach(cfg => {
                const normalizedId = cfg.deviceId.trim().toLowerCase().replace(/[-\s]+/g, '_');
                finalThresholds[normalizedId] = {
                    stored_numbers: cfg.stored_numbers
                };
            });

            const finalSettings = {
                ...settings,
                thresholds: finalThresholds
            }

            const settingsRef = ref(db, 'settings')
            await set(settingsRef, finalSettings)
            setMessage('Settings saved successfully.')
            setTimeout(() => setMessage(''), 3000)
        } catch (error: any) {
            setMessage(`Error saving: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }

    const updateThreshold = (key: keyof AppSettings['thresholds'], val: string) => {
        setSettings(s => ({
            ...s,
            thresholds: { ...s.thresholds, [key]: Number(val) }
        }))
    }

    const addDeviceConfig = () => {
        setDeviceConfigs([...deviceConfigs, { deviceId: 'New Device', subId: '', stored_numbers: '' }]);
    }

    const updateDeviceConfig = (index: number, field: keyof DeviceConfig, val: string | number) => {
        const newConfigs = [...deviceConfigs];
        newConfigs[index] = { ...newConfigs[index], [field]: val };
        setDeviceConfigs(newConfigs);
    }

    const removeDeviceConfig = (index: number) => {
        setDeviceConfigs(deviceConfigs.filter((_, i) => i !== index));
    }

    if (loading) return <div className={pageStyles.page}>Loading settings...</div>

    return (
        <div className={pageStyles.page}>

            <div className={styles.settingsGrid}>
                {/* Theme Setting */}
                <div className={styles.settingCard}>
                    <div className={styles.settingInfo}>
                        <h3 className={styles.settingTitle}>Appearance Options</h3>
                        <p className={styles.settingDesc}>
                            Toggle between light and dark modes. Dark mode is recommended for monitoring dashboards.
                        </p>
                    </div>

                    <div className={styles.settingAction}>
                        <label className={styles.toggleWrapper}>
                            <input
                                type="checkbox"
                                className={styles.toggleInput}
                                checked={theme === 'light'}
                                onChange={toggleTheme}
                            />
                            <div className={styles.toggleTrack}>
                                <div className={styles.toggleThumb} />
                                <span className={styles.toggleLabel}>
                                    {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Alert Thresholds */}
                <div className={styles.settingCard}>
                    <div className={styles.settingInfo}>
                        <h3 className={styles.settingTitle}>Global Alert Thresholds</h3>
                        <p className={styles.settingDesc}>
                            Set the global trigger percentages for Warning and Critical alerts.
                        </p>
                    </div>
                    <div className={styles.settingAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ width: '140px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Water Warning %:</label>
                            <input type="number" value={settings.thresholds.water_warning} onChange={e => updateThreshold('water_warning', e.target.value)} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'var(--surface-background)', color: 'var(--text-primary)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ width: '140px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Water Critical %:</label>
                            <input type="number" value={settings.thresholds.water_critical} onChange={e => updateThreshold('water_critical', e.target.value)} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'var(--surface-background)', color: 'var(--text-primary)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ width: '140px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Garbage Warning %:</label>
                            <input type="number" value={settings.thresholds.mesh_warning} onChange={e => updateThreshold('mesh_warning', e.target.value)} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'var(--surface-background)', color: 'var(--text-primary)' }} />
                        </div>
                    </div>
                </div>

                {/* Specific Device Configurations */}
                <div className={styles.settingCard} style={{ gridColumn: '1 / -1', display: 'block' }}>
                    <div className={styles.settingInfo} style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 className={styles.settingTitle}>Device-Specific Configurations</h3>
                                <p className={styles.settingDesc}>
                                    Assign specific alert numbers and thresholds per hardware device (Mesh Bucket / Smart Drain).
                                </p>
                            </div>
                            <button onClick={addDeviceConfig} style={{ padding: '6px 14px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                + Add Device Config
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
                        {deviceConfigs.length === 0 && (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', gridColumn: '1 / -1' }}>
                                No device-specific configurations set.
                            </div>
                        )}
                        {deviceConfigs.map((cfg, index) => {
                            const isSmartDrain = cfg.deviceId.toLowerCase().includes('smart drain');
                            const isMeshBucket = cfg.deviceId.toLowerCase().includes('mesh bucket');
                            
                            return (
                                <div key={index} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    background: 'var(--surface-background)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: isSmartDrain ? '2px solid #3b82f6' : isMeshBucket ? '2px solid #f59e0b' : '1px solid var(--surface-border)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Device Type & ID</label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                style={{ fontSize: '1.2rem', fontWeight: 700, padding: '4px 0', border: 'none', background: 'transparent', borderBottom: '1px dashed var(--text-secondary)', borderRadius: 0, marginTop: '4px', width: '100%', maxWidth: '250px', color: 'var(--text-primary)' }}
                                                value={cfg.deviceId}
                                                onChange={e => updateDeviceConfig(index, 'deviceId', e.target.value)}
                                                placeholder="e.g. Mesh Bucket 02"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeDeviceConfig(index)}
                                            style={{
                                                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px',
                                                color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem'
                                            }}
                                            title="Remove Device"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div style={{ marginTop: '8px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Alert Phone Numbers</label>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Enter mobile numbers separated by commas (e.g. +94771234567, 0712345678)</div>
                                        <textarea
                                            className={styles.input}
                                            value={cfg.stored_numbers}
                                            onChange={e => updateDeviceConfig(index, 'stored_numbers', e.target.value)}
                                            placeholder="+94771112222, +94773334444"
                                            rows={2}
                                            style={{ resize: 'none', width: '100%' }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Notifications & Integrations */}
                <div className={styles.settingCard} style={{ gridColumn: '1 / -1', display: 'block' }}>
                    <div className={styles.settingInfo} style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px', marginBottom: '24px' }}>
                        <h3 className={styles.settingTitle}>Notification Preferences</h3>
                        <p className={styles.settingDesc}>
                            Manage SMS recipients and Social Media (WhatsApp) community alerts.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* WhatsApp Group Auto-post */}
                        <div style={{ width: '100%', background: 'rgba(37, 211, 102, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                                <span style={{ color: '#25D366', fontSize: '1.4rem' }}>💬</span> WhatsApp Auto-Notification
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                Automatically post critical alerts to the community WhatsApp group.
                            </p>

                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.whatsapp_group_enabled}
                                    onChange={e => setSettings(s => ({
                                        ...s,
                                        notifications: { ...s.notifications, whatsapp_group_enabled: e.target.checked }
                                    }))}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Enable WhatsApp Auto-Posting</span>
                            </label>

                            {settings.notifications.whatsapp_group_enabled && (
                                <div style={{ marginTop: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>WhatsApp Group Invite Link:</label>
                                    <input
                                        type="text"
                                        value={settings.notifications.whatsapp_group_id}
                                        onChange={e => setSettings(s => ({
                                            ...s,
                                            notifications: { ...s.notifications, whatsapp_group_id: e.target.value }
                                        }))}
                                        placeholder="https://chat.whatsapp.com/..."
                                        style={{ width: '100%', maxWidth: '500px', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--surface-border)', background: 'var(--surface-card)', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div style={{ marginTop: '0px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: '10px 24px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'none')}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {/* MUI-style Toast Notification */}
            {message && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: message.includes('Error') ? '#fdeded' : '#edf7ed',
                    color: message.includes('Error') ? '#5f2120' : '#1e4620',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    zIndex: 9999,
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>{message.includes('Error') ? '❌' : '✅'}</span>
                    {message}
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
