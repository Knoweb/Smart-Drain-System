package com.smartdrain.alert.service;

import com.smartdrain.alert.model.TelemetryPayload;

public interface NotificationService {
    void sendHighWaterLevelAlert(TelemetryPayload payload);
    void sendLowBatteryAlert(TelemetryPayload payload);
}
