package com.smartdrain.alert.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final com.smartdrain.alert.service.AlertService alertService;

    public AlertController(com.smartdrain.alert.service.AlertService alertService) {
        this.alertService = alertService;
    }

    @PostMapping("/trigger")
    public ResponseEntity<String> triggerAlert(@RequestBody com.smartdrain.alert.model.TelemetryPayload payload) {
        System.out.println("Alert payload received for drain: " + payload.getDrainName());
        alertService.processTelemetry(payload);
        return ResponseEntity.ok("Alert received and processed successfully");
    }

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Alert & Notification Service is running");
    }
}
