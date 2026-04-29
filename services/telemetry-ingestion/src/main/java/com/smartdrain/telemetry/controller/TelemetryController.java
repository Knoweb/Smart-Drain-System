package com.smartdrain.telemetry.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    @PostMapping("/ingest")
    public ResponseEntity<String> ingestData(@RequestBody Map<String, Object> payload) {
        // TODO: Validate, format, and persist the incoming data into Supabase/PostgreSQL.
        System.out.println("Received telemetry payload: " + payload);
        return ResponseEntity.ok("Data ingested successfully");
    }

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok("Telemetry Ingestion Service is running");
    }
}
