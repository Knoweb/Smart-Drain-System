package com.smartdrain.alert.model;

import lombok.Data;
import java.util.List;

@Data
public class Settings {
    private Thresholds thresholds;
    private Notifications notifications;

    @Data
    public static class Thresholds {
        private int water_warning;
        private int water_critical;
        private int mesh_warning;
        private int battery_low;
    }

    @Data
    public static class Notifications {
        private List<String> sms_contacts;
        private boolean whatsapp_group_enabled;
        private String whatsapp_group_id;
    }
}
