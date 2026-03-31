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
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes: wrap the layout with ProtectedRoute */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/map" element={<MapPage />} />
                            <Route path="/sensors" element={<SensorsPage />} />
                            <Route path="/alerts" element={<AlertsPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Route>

                    {/* Redirect any unknown route to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    )
}
