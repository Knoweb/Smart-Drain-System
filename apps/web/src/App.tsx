/**
 * APP ROUTER — src/App.tsx
 * ---------------------------------------------------------------------------
 * WHY REACT ROUTER?
 * React Router converts your single-page app into a multi-page experience.
 * The URL changes (e.g. /map, /alerts) without a full page reload.
 *
 * Route structure:
 *   /             → DashboardPage    (overview)
 *   /map          → MapPage          (interactive drain map)
 *   /sensors      → SensorsPage      (live gauge readings)
 *   /alerts       → AlertsPage       (alert history)
 *   /reports      → ReportsPage      (CSV/PDF export)
 *   /settings     → SettingsPage
 *
 * ALL routes are children of DashboardLayout — this is what makes the
 * sidebar and topbar appear on every page without re-rendering them.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout'
import DashboardPage from '@/pages/DashboardPage'
import MapPage from '@/pages/MapPage'
import SensorsPage from '@/pages/SensorsPage'
import AlertsPage from '@/pages/AlertsPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
            <Routes>
                {/* All dashboard routes share the layout (sidebar + topbar) */}
                <Route element={<DashboardLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/sensors" element={<SensorsPage />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Redirect any unknown route to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
        </ThemeProvider>
    )
}
