-- 1. Insert Device 1 (Inlet) for every existing drain
-- We offset the latitude and longitude slightly so we can see them on the map as separate markers.
INSERT INTO public.iot_devices (id, drain_id, name, latitude, longitude, status)
SELECT 
    gen_random_uuid(),
    id,
    'Inlet Sensor Node',
    latitude + 0.0003,
    longitude + 0.0003,
    'OPERATIONAL'
FROM public.drains;

-- 2. Insert Device 2 (Outlet) for the first 2 drains only
INSERT INTO public.iot_devices (id, drain_id, name, latitude, longitude, status)
SELECT 
    gen_random_uuid(),
    id,
    'Outlet Sensor Node',
    latitude - 0.0005,
    longitude - 0.0001,
    'WARNING'
FROM public.drains
LIMIT 2;

-- 3. Insert recent sensor readings for ALL IoT devices
INSERT INTO public.sensor_readings (id, device_id, water_level_pct, water_pressure_psi, temperature_c, battery_level_pct, recorded_at)
SELECT 
    gen_random_uuid(),
    id,
    floor(random() * 100), -- random water level 0-100%
    floor(random() * 20 + 14), -- pressure 14-34 psi
    floor(random() * 10 + 25), -- temperature 25-35 °C
    floor(random() * 40 + 60), -- battery 60-100%
    now() - interval '2 minutes'
FROM public.iot_devices;

-- 4. Insert some historical readings (from 1 hour ago)
INSERT INTO public.sensor_readings (id, device_id, water_level_pct, water_pressure_psi, temperature_c, battery_level_pct, recorded_at)
SELECT 
    gen_random_uuid(),
    id,
    floor(random() * 80), 
    floor(random() * 20 + 14), 
    floor(random() * 10 + 25), 
    floor(random() * 40 + 60), 
    now() - interval '1 hour'
FROM public.iot_devices;

-- 5. Create an unresolved alert for a device in WARNING status
INSERT INTO public.alerts (id, device_id, alert_type, message, is_resolved, created_at)
SELECT 
    gen_random_uuid(),
    id,
    'HIGH_WATER_LEVEL',
    'Water level surge detected near the outlet region.',
    false,
    now() - interval '15 minutes'
FROM public.iot_devices
WHERE status = 'WARNING'
LIMIT 1;

-- 6. Create a resolved alert for low battery
INSERT INTO public.alerts (id, device_id, alert_type, message, is_resolved, created_at)
SELECT 
    gen_random_uuid(),
    id,
    'LOW_BATTERY',
    'Battery voltage dropped below 20%.',
    true,
    now() - interval '1 day'
FROM public.iot_devices
WHERE status = 'OPERATIONAL'
LIMIT 1;
