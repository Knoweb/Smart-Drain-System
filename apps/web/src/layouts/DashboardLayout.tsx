/**
 * DASHBOARD LAYOUT — src/layouts/DashboardLayout.tsx
 * ---------------------------------------------------------------------------
 * WHY A LAYOUT COMPONENT?
 * The sidebar and topbar appear on every protected page. Wrapping them in a
 * layout prevents duplication. React Router renders <Outlet /> where the
 * active page component should appear.
 *
 * Layout pattern:
 *   <DashboardLayout>
 *     ├── <Sidebar />     (fixed left column, always visible)
 *     ├── <Topbar />      (fixed top bar on the right side)
 *     └── <main>          (scrollable content area)
 *           └── <Outlet /> ← active page renders here
 */

import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import styles from './DashboardLayout.module.css'

const NAV_ITEMS = [
    { to: '/', icon: '⊞', label: 'Dashboard' },
    { to: '/map', icon: '🗺', label: 'Drain Map' },
    { to: '/sensors', icon: '📡', label: 'Sensors' },
    { to: '/alerts', icon: '🔔', label: 'Alerts' },
    { to: '/reports', icon: '📊', label: 'Reports' },
    { to: '/settings', icon: '⚙', label: 'Settings' },
]

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
            {/* ── Sidebar ─────────────────────────────────── */}
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <span className={styles.brandIcon}>💧</span>
                    {!collapsed && <span className={styles.brandName}>SmartDrain</span>}
                </div>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            <span className={styles.navIcon}>{icon}</span>
                            {!collapsed && <span className={styles.navLabel}>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <button
                    className={styles.collapseBtn}
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? '»' : '«'}
                </button>
            </aside>

            {/* ── Main area (topbar + page content) ───────── */}
            <div className={styles.main}>
                <header className={styles.topbar}>
                    <h1 className={styles.pageTitle}>Smart Drain System</h1>
                    <div className={styles.topbarRight}>
                        <span className={styles.liveBadge}>● LIVE</span>
                        <div className={styles.avatar}>AD</div>
                    </div>
                </header>

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
