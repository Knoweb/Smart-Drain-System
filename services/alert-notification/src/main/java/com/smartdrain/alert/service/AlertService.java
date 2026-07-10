package com.smartdrain.alert.service;

import com.smartdrain.alert.model.TelemetryPayload;
import com.smartdrain.alert.model.Settings;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
public class AlertService {

    private final List<NotificationService> notificationServices;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String FIREBASE_URL = "https://smart-drain-system-30dd7-default-rtdb.asia-southeast1.firebasedatabase.app/settings.json";

    public AlertService(List<NotificationService> notificationServices) {
        this.notificationServices = notificationServices;
    }

    private Settings fetchSettings() {
        try {
            Settings settings = restTemplate.getForObject(FIREBASE_URL, Settings.class);
            if (settings != null) return settings;
        } catch (Exception e) {
            System.err.println("Error fetching settings from Firebase: " + e.getMessage());
        }
        // Fallback defaults
        Settings defaultSettings = new Settings();
        Settings.Thresholds th = new Settings.Thresholds();
        th.setWater_warning(70);
        th.setWater_critical(85);
        th.setMesh_warning(70);
        th.setBattery_low(20);
        defaultSettings.setThresholds(th);
        
        Settings.Notifications notif = new Settings.Notifications();
        notif.setWhatsapp_group_enabled(false);
        notif.setSms_contacts(List.of());
        defaultSettings.setNotifications(notif);
        
        return defaultSettings;
    }

    public void processTelemetry(TelemetryPayload payload) {
        Settings settings = fetchSettings();
        
        // Water Level check
        if (payload.getWaterLevelPct() >= settings.getThresholds().getWater_critical()) {
            System.out.println("CRITICAL water level detected. Triggering alerts...");
            notificationServices.forEach(service -> service.sendHighWaterLevelAlert(payload, settings, true));
        } else if (payload.getWaterLevelPct() >= settings.getThresholds().getWater_warning()) {
            System.out.println("WARNING water level detected. Triggering alerts...");
            notificationServices.forEach(service -> service.sendHighWaterLevelAlert(payload, settings, false));
        }
        
        // Battery check
        if (payload.getBatteryLevelPct() != null && payload.getBatteryLevelPct() < settings.getThresholds().getBattery_low()) {
            System.out.println("LOW battery detected. Triggering alerts...");
            notificationServices.forEach(service -> service.sendLowBatteryAlert(payload, settings));
        }
    }
}
