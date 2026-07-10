package com.smartdrain.alert.service;

import com.smartdrain.alert.model.Settings;
import com.smartdrain.alert.model.TelemetryPayload;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppNotificationService implements NotificationService {

    @Override
    public void sendHighWaterLevelAlert(TelemetryPayload payload, Settings settings, boolean isCritical) {
        if (settings == null || settings.getNotifications() == null) {
            return;
        }

        if (!settings.getNotifications().isWhatsapp_group_enabled() || 
            settings.getNotifications().getWhatsapp_group_id() == null || 
            settings.getNotifications().getWhatsapp_group_id().trim().isEmpty()) {
            return;
        }

        String groupId = settings.getNotifications().getWhatsapp_group_id().trim();
        String levelPrefix = isCritical ? "🚨 *CRITICAL*" : "⚠️ *WARNING*";
        
        String message = String.format("%s\n*Smart Drain Alert*\nLocation: %s\nWater Level: %.1f%%\nStatus: %s\nCommunity members please be advised.",
            levelPrefix, payload.getDrainName(), payload.getWaterLevelPct(), isCritical ? "Critical High" : "Warning High");

        System.out.println("=== WHATSAPP COMMUNITY AUTO-POST ===");
        System.out.println("Target Group/Link: " + groupId);
        System.out.println("Message: \n" + message);
        // In a real app, integrate WhatsApp Business API or Twilio WhatsApp API here.
        System.out.println("====================================");
    }

    @Override
    public void sendLowBatteryAlert(TelemetryPayload payload, Settings settings) {
        if (settings == null || settings.getNotifications() == null) {
            return;
        }

        if (!settings.getNotifications().isWhatsapp_group_enabled() || 
            settings.getNotifications().getWhatsapp_group_id() == null || 
            settings.getNotifications().getWhatsapp_group_id().trim().isEmpty()) {
            return;
        }

        String groupId = settings.getNotifications().getWhatsapp_group_id().trim();
        String message = String.format("🔋 *Smart Drain Maintenance*\nLocation: %s\nBattery Level: %.1f%%\nMaintenance team dispatched.",
            payload.getDrainName(), payload.getBatteryLevelPct());

        System.out.println("=== WHATSAPP COMMUNITY AUTO-POST ===");
        System.out.println("Target Group/Link: " + groupId);
        System.out.println("Message: \n" + message);
        System.out.println("====================================");
    }
}
