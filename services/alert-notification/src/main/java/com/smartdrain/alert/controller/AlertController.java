package com.smartdrain.alert.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @PostMapping("/trigger")
    public ResponseEntity<String> triggerAlert(@RequestBody String alertData) {
        // TODO: Evaluate thresholds and send notifications (Email, SMS, Expo Push)
        System.out.println("Alert triggered: " + alertData);
        return ResponseEntity.ok("Alert received and processing");
    }

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Alert & Notification Service is running");
    }
}
