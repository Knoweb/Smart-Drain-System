package com.smartdrain.alert.service;

import com.smartdrain.alert.model.Settings;
import com.smartdrain.alert.model.TelemetryPayload;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SmsNotificationService implements NotificationService {

    @Override
    public void sendHighWaterLevelAlert(TelemetryPayload payload, Settings settings, boolean isCritical) {
        if (settings == null || settings.getNotifications() == null || settings.getNotifications().getSms_contacts() == null) {
            return;
        }

        List<String> contacts = settings.getNotifications().getSms_contacts();
        if (contacts.isEmpty()) return;

        String levelPrefix = isCritical ? "CRITICAL" : "WARNING";
        String message = String.format("[Smart Drain] %s: Water level at %s is %s (%.1f%%). Please inspect.",
            levelPrefix, payload.getDrainName(), levelPrefix.toLowerCase(), payload.getWaterLevelPct());

        System.out.println("=== SMS NOTIFICATION ===");
        System.out.println("Message: " + message);
        for (String contact : contacts) {
            if (contact != null && !contact.trim().isEmpty()) {
                System.out.println("Sending SMS to: " + contact.trim());
                // In a real app, integrate Twilio or AWS SNS here.
            }
        }
        System.out.println("========================");
    }

    @Override
    public void sendLowBatteryAlert(TelemetryPayload payload, Settings settings) {
        if (settings == null || settings.getNotifications() == null || settings.getNotifications().getSms_contacts() == null) {
            return;
        }

        List<String> contacts = settings.getNotifications().getSms_contacts();
        if (contacts.isEmpty()) return;

        String message = String.format("[Smart Drain] WARNING: Low battery at %s (%.1f%%).",
            payload.getDrainName(), payload.getBatteryLevelPct());

        System.out.println("=== SMS NOTIFICATION ===");
        System.out.println("Message: " + message);
        for (String contact : contacts) {
            if (contact != null && !contact.trim().isEmpty()) {
                System.out.println("Sending SMS to: " + contact.trim());
            }
        }
        System.out.println("========================");
    }
}
