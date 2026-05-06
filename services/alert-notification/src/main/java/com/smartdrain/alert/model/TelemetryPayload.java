package com.smartdrain.alert.model;

import lombok.Data;

@Data
public class TelemetryPayload {
    private String drainId;
    private String drainName;
    private double waterLevelPct;
    private Double waterPressurePsi;
    private Double temperatureC;
    private Integer batteryLevelPct;
    private String pushToken; // Device token for mobile push
    private String userEmail; // For email alert
}
