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
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import styles from './DashboardLayout.module.css'
import logoImg from '../../assets/12.jpeg'

const PAGE_HEADERS: Record<string, { title: string; subtitle: string }> = {
    '/': { title: 'Overview', subtitle: 'Real-time summary of all drain sensors' },
    '/map': { title: 'Drain Map', subtitle: 'Overview of drain pipelines' },
    '/sensors': { title: 'Sensor Readings', subtitle: 'Live telemetry updated via WebSockets' },
    '/register': { title: 'Register Device', subtitle: 'Add new drains, sensors, and mesh buckets' },
    '/alerts': { title: 'System Alerts', subtitle: 'Active and historical system alerts' },
    '/reports': { title: 'Reports', subtitle: 'Export historical sensor data as CSV or PDF' },
    '/settings': { title: 'Settings', subtitle: 'Configure system preferences and alerts' },
}

const NAV_ITEMS = [
    { to: '/', icon: '⊞', label: 'Dashboard' },
    { to: '/map', icon: '🗺', label: 'Drain Map' },
    { to: '/sensors', icon: '📡', label: 'Sensors' },
    { to: '/register', icon: '➕', label: 'Register' },
    { to: '/alerts', icon: '🔔', label: 'Alerts' },
    { to: '/reports', icon: '📊', label: 'Reports' },
    { to: '/settings', icon: '⚙', label: 'Settings' },
]

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const headerInfo = PAGE_HEADERS[location.pathname] || { title: 'Smart Drain System', subtitle: '' }

    const handleSignOut = async () => {
        await signOut(auth)
        navigate('/login')
    }

    // Get user initials for the avatar (from displayName or email)
    const getInitials = () => {
        if (!user) return '??'
        // Firebase User has displayName set via updateProfile()
        if (user.displayName) {
            return user.displayName.substring(0, 2).toUpperCase()
        }
        if (user.email) {
            return user.email.substring(0, 2).toUpperCase()
        }
        return 'US'
    }

    return (
        <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
            
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
            )}

            {/* ── Sidebar ─────────────────────────────────── */}
            <aside className={styles.sidebar}>
                <Link to="/" className={styles.brand}>
                    {collapsed ? (
                        <span className={styles.brandIcon}>💧</span>
                    ) : (
                        <img src={logoImg} alt="SmartDrain Logo" className={styles.brandLogo} />
                    )}
                </Link>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            onClick={() => setMobileOpen(false)}
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

                <button
                    className={styles.signOutBtn}
                    onClick={handleSignOut}
                    title="Sign Out"
                >
                    <span className={styles.navIcon}>🚪</span>
                    {!collapsed && <span className={styles.navLabel}>Sign Out</span>}
                </button>
            </aside>

            {/* ── Main area (topbar + page content) ───────── */}
            <div className={styles.main}>
                <header className={styles.topbar}>
                    <div className={styles.mobileHeaderLeft}>
                        <button 
                            className={styles.hamburgerBtn} 
                            onClick={() => setMobileOpen(true)}
                        >
                            ☰
                        </button>
                        <div className={styles.pageInfo}>
                            <h1 className={styles.pageTitle}>{headerInfo.title}</h1>
                            {headerInfo.subtitle && <p className={styles.pageSubtitle}>{headerInfo.subtitle}</p>}
                        </div>
                    </div>
                    <div className={styles.topbarRight}>
                        <span className={styles.liveBadge}>● LIVE</span>
                        <div
                            className={styles.avatar}
                            title={user?.displayName || user?.email || 'User Profile'}
                        >
                            {getInitials()}
                        </div>
                    </div>
                </header>

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
