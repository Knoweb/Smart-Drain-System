# Smart Drain System – Official User Guide
**Developed by Urban Inventors**

## 1. Introduction
Welcome to the **Smart Drain System**, a state-of-the-art IoT telemetry platform designed to monitor urban drainage infrastructure safely, reliably, and in real time. This system captures raw data from physical drain sensors—such as water levels, pressure, temperature, and battery life—and transforms it into actionable insights. 

By utilizing our platform, municipalities and facility managers can preemptively address blockages, prevent flooding, and optimize maintenance schedules without relying solely on manual inspections.

---

## 2. Getting Started
### Account Creation & Authentication
Before accessing the live telemetry data, all users must pass through our secure authentication gateway.
1. **Sign Up:** Navigate to the Login portal and toggle to the "Sign Up" mode. Enter a secure Username, Email, and Password.
2. **Sign In:** Once an account is provisioned, use the "Sign In" portal to access your personalized dashboard. 
3. **Session:** The system uses secure tokens (JWT) to authenticate all commands behind the scenes. Your session remains active, granting continuous access to real-time WebSockets until you manually sign out.

---

## 3. Platform Navigation & Features

Upon logging in, you will be greeted by the primary interface. The navigation sidebar on the left provides quick access to the core modules of the platform.

### 3.1. Overview Dashboard (`/`)
**Purpose:** Provides an immediate, bird's-eye view of your entire infrastructure.
- **Summary Cards:** Instantly view the total number of monitored sites (Parent Units) alongside their current status (Operational, Warning, or Critical).
- **System Status Chart:** A visual breakdown of active network health.
- **24-Hour Trend Graph:** Observe the aggregate water-level fluctuations over the last day to spot anomalies quickly.

### 3.2. Live Drain Map (`/map`)
**Purpose:** Geospatial tracking of physical infrastructure.
- **Interactive Overview:** A full-page visual map powered by live coordinates dynamically plots where every sensor is deployed across the city/facility.
- **Status Indicators:** Pins on the map reflect live warning/critical boundaries. If a pin turns red, you immediately know *where* the potential flood is.
- **Granular Maps:** Individual drain cards beneath the main map allow operators to reset map views and analyze specific regional clusters.

### 3.3. Sensor Readings (`/sensors`)
**Purpose:** To monitor the raw heartbeat of the hardware.
- **Live Telemetry:** This page connects directly to the hardware data stream via WebSockets.
- **Metrics Covered:** Watch exact percentages of water blockages, current flow pressure, temperature readings, and the physical battery health of the underground monitors.
- **Parent/Child Units:** See logical groupings of master sensors (Parent Units) vs downstream secondary nodes (Child Units). 

### 3.4. System Alerts (`/alerts`)
**Purpose:** The automated watchdog protocol.
- **Threshold Triggers:** The backend automation engine constantly evaluates rules. For example, if raw data confirms a continuous water level `> 80%`, the system flags it as CRITICAL.
- **Actionable Log:** Operators use this page to view active crisis notifications, what triggered them, when they occurred, and when the hardware returned to a normal, operating baseline.

### 3.5. Reports & Export (`/reports`)
**Purpose:** Compliance, historical audits, and managerial presentations.
- **Historical Queries:** Pull data spanning the last 24 hours (e.g., from 4:00 PM yesterday to 4:00 PM today) or specific customized dates.
- **PDF & CSV Generation:** Export verified sensor histories to standard CSV for spreadsheet manipulation or generate PDF presentations covering localized flood events. 

### 3.6. Settings (`/settings`)
**Purpose:** Administrative controls.
- Customize specific alert thresholds.
- Assign naming conventions to devices (e.g., naming raw hardware IDs something human-readable like "Main Street Enclosure Alpha").

---

## 4. How the Technology Works (For Stakeholders)
While the interface remains simple, the backend infrastructure is robust:
- **Asynchronous Processing:** Behind the scenes, the *Alert Service* constantly monitors the data without slowing down your browser.
- **Real-Time Data Streams:** Whenever hardware deployed in the field detects a change, the platform pushes that update directly to your screen instantly—no page refreshing required.
- **Secure Cloud Storage:** All historical data is safely persisted, backed up, and structurally encrypted in the cloud (Supabase PostgreSQL infrastructure).

## 5. Conclusion
The Smart Drain System drastically reduces the financial impact of undetected drain surges. By giving your workforce eyes underground, you shift from reactive emergency management to proactive, data-driven maintenance.
