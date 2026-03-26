import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { HistoricalReading } from '@/hooks/useHistoricalReadings'

export function exportToCSV(readings: HistoricalReading[], filename = 'report.csv') {
    const headers = ['Date', 'Drain Name', 'Water Level (%)', 'Pressure (PSI)', 'Temperature (C)', 'Battery (%)']
    
    const rows = readings.map(r => [
        new Date(r.recorded_at).toLocaleString(),
        r.drains?.name ?? 'Unknown',
        r.water_level_pct,
        r.water_pressure_psi ?? '',
        r.temperature_c ?? '',
        r.battery_level_pct ?? ''
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export function exportToPDF(readings: HistoricalReading[], filename = 'report.pdf') {
    const doc = new jsPDF()

    const headers = [['Date / Time', 'Drain Name', 'Water Level', 'Pressure', 'Temp', 'Battery']]
    
    const data = readings.map(r => [
        new Date(r.recorded_at).toLocaleString(),
        r.drains?.name ?? 'Unknown',
        `${r.water_level_pct}%`,
        r.water_pressure_psi != null ? `${r.water_pressure_psi.toFixed(1)} PSI` : '-',
        r.temperature_c != null ? `${r.temperature_c.toFixed(1)} °C` : '-',
        r.battery_level_pct != null ? `${r.battery_level_pct}%` : '-'
    ])

    doc.setFontSize(16)
    doc.text("Smart Drain - Historical Report", 14, 15)
    
    autoTable(doc, {
        head: headers,
        body: data,
        startY: 22,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] }
    })

    doc.save(filename)
}
