package com.smartdrain.alert.service;

import com.smartdrain.alert.model.TelemetryPayload;
import com.smartdrain.alert.model.Settings;

public interface NotificationService {
    void sendHighWaterLevelAlert(TelemetryPayload payload, Settings settings, boolean isCritical);
    void sendLowBatteryAlert(TelemetryPayload payload, Settings settings);
}
