import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, SafeAreaView } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function DashboardScreen() {
  const [readings, setReadings] = useState<any[]>([]);

  useEffect(() => {
    fetchReadings();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('public:sensor_readings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, payload => {
        setReadings(current => [payload.new, ...current].slice(0, 50));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, []);

  const fetchReadings = async () => {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*, iot_devices(name)')
      .order('recorded_at', { ascending: false })
      .limit(20);
      
    if (data) setReadings(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Live Telemetry</Text>
      <FlatList
        data={readings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, item.water_level_pct > 80 ? styles.criticalCard : styles.normalCard]}>
            <Text style={styles.deviceName}>{item.iot_devices?.name || item.device_id}</Text>
            <Text style={styles.metric}>Water Level: {item.water_level_pct}%</Text>
            <Text style={styles.metric}>Status: {item.water_level_pct > 80 ? '🚨 CRITICAL' : '✅ NORMAL'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1a202c', marginTop: 40 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  normalCard: { backgroundColor: '#ffffff', borderLeftWidth: 4, borderLeftColor: '#38a169' },
  criticalCard: { backgroundColor: '#fff5f5', borderLeftWidth: 4, borderLeftColor: '#e53e3e' },
  deviceName: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  metric: { fontSize: 16, color: '#4a5568', marginBottom: 4 }
});
