import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, SafeAreaView } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchAlerts();
    
    const channel = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, payload => {
        fetchAlerts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*, iot_devices(name, drains(name))')
      .order('created_at', { ascending: false })
      .limit(30);
      
    if (data) setAlerts(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>System Alerts</Text>
      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, item.is_resolved ? styles.resolvedCard : styles.activeCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.alertType}>{item.alert_type.replace('_', ' ')}</Text>
              <Text style={styles.status}>{item.is_resolved ? '✅ RESOLVED' : '🚨 ACTIVE'}</Text>
            </View>
            <Text style={styles.deviceName}>Source: {item.iot_devices?.name || 'Unknown Device'}</Text>
            {item.message && <Text style={styles.message}>{item.message}</Text>}
            <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1a202c', marginTop: 40 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  activeCard: { backgroundColor: '#fff5f5', borderLeftWidth: 4, borderLeftColor: '#e53e3e' },
  resolvedCard: { backgroundColor: '#ffffff', borderLeftWidth: 4, borderLeftColor: '#718096', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  alertType: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  status: { fontSize: 12, fontWeight: 'bold', color: '#4a5568' },
  deviceName: { fontSize: 14, color: '#4a5568', marginBottom: 4 },
  message: { fontSize: 14, color: '#2d3748', marginBottom: 8, fontStyle: 'italic' },
  time: { fontSize: 12, color: '#a0aec0' }
});
