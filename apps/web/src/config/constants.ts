/**
 * APP CONSTANTS — src/config/constants.ts
 * ---------------------------------------------------------------------------
 * Centralizing magic numbers and config values here means:
 * - If the alert threshold changes from 80% to 85%, you change ONE line.
 * - Components never contain hardcoded values — they import from here.
 */

/** Water level % above which an alert is triggered */
export const ALERT_THRESHOLD_WATER_LEVEL = 80

/** Battery % below which a LOW_BATTERY alert fires */
export const ALERT_THRESHOLD_BATTERY = 20

/** Map center coordinates — Colombo, Sri Lanka */
export const MAP_CENTER: [number, number] = [6.9271, 79.8612]

/** Default map zoom level */
export const MAP_DEFAULT_ZOOM = 13

/** How often to refetch data (milliseconds) — used in some hooks */
export const POLLING_INTERVAL_MS = 30_000  // 30 seconds

/** Status to CSS class mapping — used by status badges and markers */
export const STATUS_CLASS_MAP: Record<string, string> = {
    OPERATIONAL: 'status-operational',
    WARNING: 'status-warning',
    CRITICAL: 'status-critical',
}

/** Status to color value — used by Recharts and map markers */
export const STATUS_COLOR_MAP: Record<string, string> = {
    OPERATIONAL: '#22c55e',
    WARNING: '#f59e0b',
    CRITICAL: '#ef4444',
}
