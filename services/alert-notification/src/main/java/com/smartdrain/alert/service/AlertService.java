package com.smartdrain.alert.service;

import com.smartdrain.alert.model.TelemetryPayload;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AlertService {

    private final List<NotificationService> notificationServices;

    // Spring will automatically inject all beans implementing NotificationService
    public AlertService(List<NotificationService> notificationServices) {
        this.notificationServices = notificationServices;
    }

    public void processTelemetry(TelemetryPayload payload) {
        // Water Level check: configurable threshold (e.g., > 80%)
        if (payload.getWaterLevelPct() > 80.0) {
            System.out.println("High water level detected. Triggering alerts...");
            notificationServices.forEach(service -> service.sendHighWaterLevelAlert(payload));
        }
        
        // Battery check: configurable threshold (e.g., < 20%)
        if (payload.getBatteryLevelPct() != null && payload.getBatteryLevelPct() < 20) {
            System.out.println("Low battery detected. Triggering alerts...");
            notificationServices.forEach(service -> service.sendLowBatteryAlert(payload));
        }
    }
}
