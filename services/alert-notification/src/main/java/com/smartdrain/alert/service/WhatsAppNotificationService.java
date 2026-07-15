package com.smartdrain.alert.service;

import com.smartdrain.alert.model.Settings;
import com.smartdrain.alert.model.TelemetryPayload;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

@Service
public class WhatsAppNotificationService implements NotificationService {

    private final String ID_INSTANCE = "710722682516";
    private final String API_TOKEN_INSTANCE = "5ad1117ebeba4d0aab69e23dc4e9705ddf06af0368b5462891";
    // Group ID discovered from Green API contacts list
    private final String SMART_DRAIN_GROUP_ID = "120363429365188401@g.us"; 

    private void sendGreenApiMessage(String message) {
        try {
            String url = String.format("https://7107.api.greenapi.com/waInstance%s/sendMessage/%s", ID_INSTANCE, API_TOKEN_INSTANCE);
            
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> body = new HashMap<>();
            body.put("chatId", SMART_DRAIN_GROUP_ID);
            body.put("message", message);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, String.class);
            System.out.println("✅ WhatsApp message sent successfully via Green API!");
        } catch (Exception e) {
            System.err.println("❌ Failed to send WhatsApp message: " + e.getMessage());
        }
    }

    @Override
    public void sendHighWaterLevelAlert(TelemetryPayload payload, Settings settings, boolean isCritical) {
        if (settings == null || settings.getNotifications() == null) {
            return;
        }
        
        if (!settings.getNotifications().isWhatsapp_group_enabled()) {
            return;
        }

        String levelPrefix = isCritical ? "🚨 *CRITICAL ALERT*" : "⚠️ *WARNING*";
        
        String message = String.format("%s\n\n*Smart Drain System*\n📍 Location: %s\n💧 Water Level: %.1f%%\n📌 Status: %s\n\nCommunity members please be advised.",
            levelPrefix, payload.getDrainName(), payload.getWaterLevelPct(), isCritical ? "Critical High" : "Warning High");

        System.out.println("=== WHATSAPP COMMUNITY AUTO-POST ===");
        System.out.println("Message: \n" + message);
        sendGreenApiMessage(message);
        System.out.println("====================================");
    }

    @Override
    public void sendLowBatteryAlert(TelemetryPayload payload, Settings settings) {
        if (settings == null || settings.getNotifications() == null) {
            return;
        }
        
        if (!settings.getNotifications().isWhatsapp_group_enabled()) {
            return;
        }
        String message = String.format("🔋 *Smart Drain Maintenance*\n\n📍 Location: %s\n🔋 Battery Level: %.1f%%\n\nMaintenance team has been notified.",
            payload.getDrainName(), payload.getBatteryLevelPct());

        System.out.println("=== WHATSAPP COMMUNITY AUTO-POST ===");
        System.out.println("Message: \n" + message);
        sendGreenApiMessage(message);
        System.out.println("====================================");
    }

    @Override
    public void sendMeshWarningAlert(TelemetryPayload payload, Settings settings) {
        if (settings == null || settings.getNotifications() == null) {
            return;
        }
        
        if (!settings.getNotifications().isWhatsapp_group_enabled()) {
            return;
        }
        
        String message = String.format("🗑️ *Garbage Level Warning*\n\n📍 Location: %s\n🗑️ Mesh Bin Level: %.1f%%\n\nPlease arrange for cleaning.",
            payload.getDrainName(), payload.getMeshLevelPct() != null ? payload.getMeshLevelPct() : 0.0);

        System.out.println("=== WHATSAPP COMMUNITY AUTO-POST ===");
        System.out.println("Message: \n" + message);
        sendGreenApiMessage(message);
        System.out.println("====================================");
    }
}
