/**
 * DASHBOARD PAGE — src/pages/DashboardPage.tsx
 * ---------------------------------------------------------------------------
 * The main monitoring overview. Shows:
 *
 *   1. Stat cards  — live counts: total / operational / warning / critical
 *   2. Charts row  — StatusPieChart (donut) + WaterLevelTrendChart (24h line)
 *   3. Drain table — list of all drain locations with status badges
 *
 * Data flow:
 *   useDrains()             → stat cards + donut + drain table (live Realtime)
 *   useHistoricalReadings() → trend chart (24h snapshot, no Realtime needed)
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDrains } from '@/hooks/useDrains'
import { useHistoricalReadings, TimeRange } from '@/hooks/useHistoricalReadings'
import { useSettings } from '@/hooks/useSettings'
import type { DrainStatus } from '@/types'
import { StatusPieChart } from '@/features/dashboard/StatusPieChart'
import { WaterLevelTrendChart } from '@/features/dashboard/WaterLevelTrendChart'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
    const navigate = useNavigate()
    const settings = useSettings()
    const [timeRange, setTimeRange] = useState<TimeRange>('24h')
    const [selectedSensor, setSelectedSensor] = useState<string>('all')
    const { drains, loading: drainsLoading, error: drainsError } = useDrains()
    const { readings, loading: readingsLoading } = useHistoricalReadings(timeRange, 'all')
    
    // TEMPORARY: Reset Mock Data
    const handleResetData = async () => {
        if (!window.confirm('Reset database?')) return;
        const { ref, set } = await import('firebase/database');
        const { db } = await import('@/lib/firebase');
        const logsRef = ref(db, 'sensor_logs');
        
        const now = Date.now();
        const mockData = {
            'reading_drain_01_node1': {
                device_id: 'smart_drain_01',
                sub_id: 'Device-01',
                device_type: 'drain_sensor',
                water_level_pct: 26,
                water_pressure_psi: 14.5,
                temperature_c: 28,
                battery_level_pct: 85,
                timestamp: now,
                latitude: 6.949825,
                longitude: 79.880478
            },
            'reading_drain_01_mesh1': {
                device_id: 'smart_drain_01',
                sub_id: 'mesh_bucket_01',
                device_type: 'mesh_bucket',
                mesh_level_pct: 12,
                battery_level_pct: 90,
                timestamp: now,
                latitude: 6.949825,
                longitude: 79.880478
            }
        };
        
        try {
            await set(logsRef, mockData);
            alert('Database reset successful. Only smart_drain_01 remains.');
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    }

    const countByStatus = (status: DrainStatus) =>
        drains.filter(d => d.status === status).length

    // Get the primary drain (Orugodawatte Drain System)
    const primaryDrain = drains.length > 0 ? drains[0] : null;
    const smartDrain = primaryDrain?.iot_devices?.[0];
    const meshBucket = primaryDrain?.mesh_buckets?.[0];

    // Find the absolute latest readings for these specific devices
    const latestSmartDrainReading = smartDrain ? readings.find(r => r.sub_id === smartDrain.id) : null;
    const latestMeshBucketReading = meshBucket ? readings.find(r => r.sub_id === meshBucket.id) : null;

    const currentWaterLevel = latestSmartDrainReading?.water_level_pct ?? 0;
    const currentGarbageLevel = latestMeshBucketReading?.mesh_level_pct ?? latestMeshBucketReading?.water_level_pct ?? 0;
    const currentTemp = latestSmartDrainReading?.temperature_c ?? 28;

    const isWaterHigh = currentWaterLevel >= settings.thresholds.water_warning;
    
    let lowBatteryCount = 0;
    drains.forEach(d => {
        d.iot_devices?.forEach(dev => {
            const r = readings.find(reading => reading.sub_id === dev.id);
            if (r?.battery_level_pct != null && r.battery_level_pct < settings.thresholds.battery_low) {
                lowBatteryCount++;
            }
        });
        d.mesh_buckets?.forEach(mb => {
            const r = readings.find(reading => reading.sub_id === mb.id);
            if (r?.battery_level_pct != null && r.battery_level_pct < settings.thresholds.battery_low) {
                lowBatteryCount++;
            }
        });
    });

    const batteryInsightTitle = lowBatteryCount > 0 ? 'Battery Warning' : 'System Health';
    const batteryInsightText = lowBatteryCount > 0 
        ? `${lowBatteryCount} sensor node(s) have low battery.` 
        : 'All sensor nodes reporting excellent battery life.';
    
    const flowInsightTitle = isWaterHigh ? 'High Water Level' : 'Optimal Flow';
    const flowInsightText = isWaterHigh 
        ? 'Drainage levels are exceeding warning thresholds.' 
        : 'Drainage levels are well below warning thresholds.';

    const statusColorMap: Record<string, string> = {
        'OPERATIONAL': '#10b981',
        'WARNING': '#f97316'
    };

    const statusClassMap: Record<string, string> = {
        'OPERATIONAL': styles.emerald,
        'WARNING': styles.orange
    };

    const primaryStatusColor = primaryDrain ? (statusColorMap[primaryDrain.status] ?? '#10b981') : '#10b981';
    const primaryStatusClass = primaryDrain ? (statusClassMap[primaryDrain.status] ?? styles.emerald) : styles.emerald;

    const statusBgClassMap: Record<string, string> = {
        'OPERATIONAL': styles.bgEmerald,
        'WARNING': styles.bgOrange
    };
    const primaryBgClass = primaryDrain ? (statusBgClassMap[primaryDrain.status] ?? styles.bgEmerald) : styles.bgEmerald;

    return (
        <div className={styles.page}>
            {drainsError && (
                <div className={styles.errorBanner}>
                    ⚠️ Could not load drains: {drainsError}
                </div>
            )}

            <div className={styles.dashboardHeader}>
                <div>
                    <h1 className={styles.dashboardTitle}>Overview</h1>
                    <p className={styles.dashboardSubtitle}>Real-time summary of all drain sensors</p>
                </div>
            </div>

            {!drainsLoading && primaryDrain ? (
                <>
                    {/* TOP SECTION: System Status & Stat Cards */}
                    <div className={styles.topSection}>
                        {/* System Status Pie Chart */}
                        <div className={styles.pieCard} onClick={() => navigate('/sensors')} style={{ flex: '1 1 300px' }}>
                            <h3 className={styles.chartTitle} style={{ marginBottom: '1rem', width: '100%', textAlign: 'left' }}>System Status</h3>
                            <StatusPieChart drains={drains} />
                        </div>

                        {/* Stat Cards */}
                        <div className={styles.statGrid} style={{ flex: '3 1 600px', margin: 0 }}>
                        <div className={`${styles.statCard} ${styles.bgBlue}`} onClick={() => navigate('/sensors')}>
                            <div className={`${styles.statIconWrapper} ${styles.blue}`}>🌊</div>
                            <div className={styles.statContent}>
                                <span className={styles.statLabel}>Total Drains</span>
                                <span className={styles.statValue}>{drains.length}</span>
                            </div>
                        </div>

                        <div className={`${styles.statCard} ${primaryBgClass}`} onClick={() => navigate('/sensors')}>
                            <div className={`${styles.statIconWrapper} ${primaryStatusClass}`}>🛡️</div>
                            <div className={styles.statContent}>
                                <span className={styles.statLabel}>{primaryDrain.name}</span>
                                <span className={styles.statValue} style={{ color: primaryStatusColor }}>
                                    {primaryDrain.status}
                                </span>
                            </div>
                        </div>

                        {smartDrain && (
                            <div className={`${styles.statCard} ${styles.bgCyan}`} onClick={() => document.getElementById('water-chart')?.scrollIntoView({ behavior: 'smooth' })}>
                                <div className={`${styles.statIconWrapper} ${styles.cyan}`}>💧</div>
                                <div className={styles.statContent}>
                                    <span className={styles.statLabel}>{smartDrain.name}</span>
                                    <span className={styles.statValue}>{currentWaterLevel}% <span style={{fontSize: '1.1rem', color: 'var(--text-muted)'}}>Water</span></span>
                                </div>
                            </div>
                        )}

                        {meshBucket && (
                            <div className={`${styles.statCard} ${styles.bgPurple}`} onClick={() => document.getElementById('garbage-chart')?.scrollIntoView({ behavior: 'smooth' })}>
                                <div className={`${styles.statIconWrapper} ${styles.purple}`}>🗑️</div>
                                <div className={styles.statContent}>
                                    <span className={styles.statLabel}>{meshBucket.name}</span>
                                    <span className={styles.statValue}>{currentGarbageLevel}% <span style={{fontSize: '1.1rem', color: 'var(--text-muted)'}}>Garbage</span></span>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* DASHBOARD GRID (allows reordering on mobile) */}
                    <div className={styles.dashboardGrid}>
                        {/* LEFT COLUMN: Charts */}
                        <div className={styles.chartsCol}>
                            <div className={`${styles.chartCard} ${styles.waterChartWrapper}`} style={{ cursor: 'default' }}>
                                <div className={styles.chartCardHeader}>
                                    <div>
                                        <h3 className={styles.chartTitle}>Water Level Statistics</h3>
                                        <span className={styles.chartSubtitle}>{smartDrain?.name}</span>
                                    </div>
                                </div>
                                <div style={{ flex: 1, minHeight: '300px' }}>
                                    <WaterLevelTrendChart
                                        readings={smartDrain ? readings.filter(r => r.sub_id === smartDrain.id) : []}
                                        loading={readingsLoading}
                                        alertThreshold={settings.thresholds.water_warning}
                                        metricKey="water_level_pct"
                                        title=""
                                    />
                                </div>
                            </div>

                            <div className={`${styles.chartCard} ${styles.garbageChartWrapper}`} style={{ cursor: 'default' }} id="garbage-chart">
                                <div className={styles.chartCardHeader}>
                                    <div>
                                        <h3 className={styles.chartTitle}>Garbage Level Statistics</h3>
                                        <span className={styles.chartSubtitle}>{meshBucket?.name}</span>
                                    </div>
                                </div>
                                <div style={{ flex: 1, minHeight: '300px' }}>
                                    <WaterLevelTrendChart
                                        readings={meshBucket ? readings.filter(r => r.sub_id === meshBucket.id) : []}
                                        loading={readingsLoading}
                                        alertThreshold={settings.thresholds.mesh_warning}
                                        metricKey="water_level_pct"
                                        title=""
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Alerts & Insights */}
                        <div className={styles.sidebarCol}>
                            <div className={styles.alertCard} onClick={() => navigate('/alerts')}>
                                <div className={styles.alertIcon}>🚨</div>
                                <div className={styles.alertContent}>
                                    <div className={styles.alertTitle}>Water Alert Threshold</div>
                                    <div className={styles.alertDesc}>Warning Level</div>
                                </div>
                                <div className={styles.alertValue}>{settings.thresholds.water_warning}%</div>
                            </div>

                            <div className={styles.alertCard} onClick={() => navigate('/alerts')}>
                                <div className={`${styles.alertIcon} ${styles.warning}`}>⚠️</div>
                                <div className={styles.alertContent}>
                                    <div className={styles.alertTitle}>Garbage Alert Threshold</div>
                                    <div className={styles.alertDesc}>Warning Level</div>
                                </div>
                                <div className={`${styles.alertValue} ${styles.warning}`}>{settings.thresholds.mesh_warning}%</div>
                            </div>

                            {/* SMART INSIGHTS */}
                            <div className={styles.insightsWrapper}>
                            <div className={styles.insightsHeader}>
                                <div className={styles.insightsIconWrapper}>
                                    <span className={styles.insightsIcon}>🌤️</span>
                                </div>
                                <div>
                                    <h3 className={styles.insightsTitle}>Live Insights</h3>
                                    <span className={styles.insightsSubtitle}>Orugodawatte Region</span>
                                </div>
                            </div>
                            
                            <div className={styles.insightsContent}>
                                <div className={styles.weatherMain}>
                                    <div className={styles.weatherTemp}>{currentTemp.toFixed(1)}°C</div>
                                    <div className={styles.weatherCondition}>Local Temp</div>
                                </div>
                                
                                <div className={styles.insightBox}>
                                    <span className={styles.insightBoxIcon}>💧</span>
                                    <div className={styles.insightBoxText}>
                                        <strong style={{ color: isWaterHigh ? 'var(--color-warning)' : 'inherit' }}>{flowInsightTitle}</strong>
                                        <span>{flowInsightText}</span>
                                    </div>
                                </div>
                                
                                <div className={styles.insightBox}>
                                    <span className={styles.insightBoxIcon}>🔋</span>
                                    <div className={styles.insightBoxText}>
                                        <strong style={{ color: lowBatteryCount > 0 ? 'var(--color-warning)' : 'inherit' }}>{batteryInsightTitle}</strong>
                                        <span>{batteryInsightText}</span>
                                    </div>
                                </div>
                                </div>

                                {/* System Status Footer to fill space */}
                                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px dashed rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System operating optimally</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.emptyState}>
                    <p>No sensor readings found. Make sure your hardware is sending data.</p>
                </div>
            )}
        </div>
    )
}
