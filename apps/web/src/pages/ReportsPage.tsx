import { useState } from 'react'
import { useDrains } from '@/hooks/useDrains'
import { useHistoricalReadings, TimeRange } from '@/hooks/useHistoricalReadings'
import { exportToCSV, exportToPDF } from '@/lib/exportUtils'
import styles from './ReportsPage.module.css'
import pageStyles from './Page.module.css'

export default function ReportsPage() {
    const { drains } = useDrains()
    const [timeRange, setTimeRange] = useState<TimeRange>('24h')
    const [selectedDevice, setSelectedDevice] = useState<string>('all')

    const { readings, loading, error } = useHistoricalReadings(timeRange, selectedDevice)

    const handleExportCSV = () => {
        exportToCSV(readings, `drain_report_${new Date().toISOString().split('T')[0]}.csv`)
    }

    return (
        <div className={pageStyles.page}>

            <div className={`printHide ${styles.filters}`}>
                <div className={styles.filterGroup}>
                    <label>Time Range</label>
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                        className={styles.select}
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="all">All Historical Data</option>
                    </select>
                </div>
                
                <div className={styles.filterGroup}>
                    <label>IoT Device</label>
                    <select 
                        value={selectedDevice} 
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">All Devices</option>
                        {drains.map(d => (
                            <optgroup key={d.id} label={d.name}>
                                {(d.iot_devices || []).map(device => (
                                    <option key={device.id} value={device.id}>{device.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div className={styles.actions}>
                    <button 
                        onClick={handleExportCSV} 
                        disabled={readings.length === 0}
                        className={styles.btnSecondary}
                    >
                        ⬇ Export CSV
                    </button>
                    <button 
                        onClick={() => exportToPDF(readings, `drain_report_${new Date().toISOString().split('T')[0]}.pdf`)}
                        disabled={readings.length === 0}
                        className={styles.btnSecondary}
                    >
                        🖨 Export PDF
                    </button>
                </div>
            </div>

            {error && (
                <div className={pageStyles.errorBanner}>
                    Failed to load readings: {error}
                </div>
            )}

            <div className={pageStyles.drainTable}>
                <div className={`printHide ${pageStyles.tableTitle}`}>
                    Data Summary ({readings.length} records)
                </div>
                {loading ? (
                    <div className={styles.loading}>Loading data...</div>
                ) : readings.length === 0 ? (
                    <div className={styles.empty}>No readings found for the selected filters.</div>
                ) : (
                    <table className={pageStyles.table}>
                        <thead>
                            <tr>
                                <th>Date / Time</th>
                                <th>Drain</th>
                                <th>Device</th>
                                <th>Water Level</th>
                                <th>Pressure</th>
                                <th>Temp</th>
                                <th>Battery</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readings.map(r => (
                                <tr key={r.id}>
                                    <td>{new Date(r.recorded_at).toLocaleString()}</td>
                                    <td>{r.iot_devices?.drains?.name ?? 'Unknown'}</td>
                                    <td>{r.iot_devices?.name ?? 'Unknown'}</td>
                                    <td>{r.water_level_pct}%</td>
                                    <td>{r.water_pressure_psi != null ? `${r.water_pressure_psi.toFixed(1)} PSI` : '-'}</td>
                                    <td>{r.temperature_c != null ? `${r.temperature_c.toFixed(1)} °C` : '-'}</td>
                                    <td>{r.battery_level_pct != null ? `${r.battery_level_pct}%` : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Print overrides to format nicely as a report and hide sidebars */}
            <style>{`
                @media print {
                    .printHide, aside, header {
                        display: none !important;
                    }
                    body, html {
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    * {
                        color: black !important;
                        text-shadow: none !important;
                        box-shadow: none !important;
                    }
                    table {
                        width: 100%;
                        border: 1px solid #ccc;
                    }
                    th, td {
                        border-bottom: 1px solid #ddd;
                        padding: 8px !important;
                        text-align: left;
                    }
                    th { font-weight: bold; }
                }
            `}</style>
        </div>
    )
}
