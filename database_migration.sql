-- 1. Create the new iot_devices table
CREATE TABLE public.iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drain_id UUID NOT NULL REFERENCES public.drains(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'OPERATIONAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Modify sensor_readings
-- We TRUNCATE table to avoid null errors since existing readings won't have a device_id.
TRUNCATE TABLE public.sensor_readings CASCADE;
ALTER TABLE public.sensor_readings 
    ADD COLUMN device_id UUID NOT NULL REFERENCES public.iot_devices(id) ON DELETE CASCADE;
ALTER TABLE public.sensor_readings 
    DROP COLUMN drain_id;

-- 3. Modify alerts
TRUNCATE TABLE public.alerts CASCADE;
ALTER TABLE public.alerts 
    ADD COLUMN device_id UUID NOT NULL REFERENCES public.iot_devices(id) ON DELETE CASCADE;
ALTER TABLE public.alerts 
    DROP COLUMN drain_id;

-- 4. Re-enable realtime if needed
-- alter publication supabase_realtime add table iot_devices;
