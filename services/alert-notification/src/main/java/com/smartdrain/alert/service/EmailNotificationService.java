package com.smartdrain.alert.service;

import com.smartdrain.alert.model.TelemetryPayload;
import com.smartdrain.alert.model.Settings;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService implements NotificationService {

    private final JavaMailSender mailSender;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendHighWaterLevelAlert(TelemetryPayload payload, Settings settings, boolean isCritical) {
        if (payload.getUserEmail() == null || payload.getUserEmail().isEmpty()) return;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(payload.getUserEmail());
        String levelPrefix = isCritical ? "CRITICAL" : "WARNING";
        message.setSubject(levelPrefix + ": High Water Level at " + payload.getDrainName());
        message.setText("The water level at " + payload.getDrainName() + 
            " has reached " + payload.getWaterLevelPct() + "%. Please check the dashboard.");
            
        try {
            mailSender.send(message);
            System.out.println("Email sent successfully to " + payload.getUserEmail());
        } catch (Exception e) {
            System.err.println("Failed to send email to " + payload.getUserEmail() + ": " + e.getMessage());
        }
    }

    @Override
    public void sendLowBatteryAlert(TelemetryPayload payload, Settings settings) {
        if (payload.getUserEmail() == null || payload.getUserEmail().isEmpty()) return;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(payload.getUserEmail());
        message.setSubject("WARNING: Low Battery at " + payload.getDrainName());
        message.setText("The battery level for the sensor at " + payload.getDrainName() + 
            " is currently at " + payload.getBatteryLevelPct() + "%. Please schedule a battery replacement.");
            
        try {
            mailSender.send(message);
            System.out.println("Low battery email sent to " + payload.getUserEmail());
        } catch (Exception e) {
            System.err.println("Failed to send email to " + payload.getUserEmail() + ": " + e.getMessage());
        }
    }
}
