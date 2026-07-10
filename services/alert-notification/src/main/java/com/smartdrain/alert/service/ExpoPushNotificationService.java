package com.smartdrain.alert.service;

import com.smartdrain.alert.model.TelemetryPayload;
import com.smartdrain.alert.model.Settings;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpoPushNotificationService implements NotificationService {

    private final WebClient webClient;

    public ExpoPushNotificationService(WebClient.Builder webClientBuilder) {
        // Expo push notification endpoint
        this.webClient = webClientBuilder.baseUrl("https://exp.host/--/api/v2").build();
    }

    @Override
    public void sendHighWaterLevelAlert(TelemetryPayload payload, Settings settings, boolean isCritical) {
        if (payload.getPushToken() == null || payload.getPushToken().isEmpty()) return;
        
        String levelPrefix = isCritical ? "CRITICAL" : "WARNING";
        sendPushNotification(payload.getPushToken(), 
            levelPrefix + " Water Level Alert", 
            "⚠️ Water level at " + payload.getDrainName() + " is " + levelPrefix.toLowerCase() + ": " + payload.getWaterLevelPct() + "%");
    }

    @Override
    public void sendLowBatteryAlert(TelemetryPayload payload, Settings settings) {
        if (payload.getPushToken() == null || payload.getPushToken().isEmpty()) return;
        
        sendPushNotification(payload.getPushToken(), 
            "Low Battery Warning", 
            "🔋 Battery level at " + payload.getDrainName() + " is " + payload.getBatteryLevelPct() + "%");
    }

    private void sendPushNotification(String token, String title, String body) {
        Map<String, Object> message = new HashMap<>();
        message.put("to", token);
        message.put("sound", "default");
        message.put("title", title);
        message.put("body", body);

        webClient.post()
            .uri("/push/send")
            .bodyValue(List.of(message))
            .retrieve()
            .bodyToMono(String.class)
            .subscribe(
                response -> System.out.println("Push notification sent to Expo: " + response),
                error -> System.err.println("Error sending push notification: " + error.getMessage())
            );
    }
}
