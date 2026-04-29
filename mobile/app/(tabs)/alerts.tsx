import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { IconSymbol } from '../../components/ui/icon-symbol';

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

  const markResolved = async (id: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ is_resolved: true })
      .eq('id', id);
    if (!error) {
      fetchAlerts();
    } else {
      Alert.alert('Error', 'Failed to resolve alert');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Alerts</Text>
        <Text style={styles.subtitle}>Active and historical system alerts</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={alerts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, item.is_resolved ? styles.resolvedCard : styles.activeCard]}>
            <View style={styles.iconContainer}>
              <IconSymbol name={item.alert_type.includes('BATTERY') ? 'bolt.fill' : 'exclamationmark.triangle.fill'} size={24} color={item.is_resolved ? '#a0aec0' : '#fc8181'} />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.drainDeviceText}>
                <Text style={{fontWeight: 'bold'}}>{item.iot_devices?.drains?.name || 'Unknown Drain'}</Text> › {item.iot_devices?.name || 'Unknown Device'}
              </Text>
              <Text style={[styles.alertType, { color: item.is_resolved ? '#a0aec0' : '#fc8181' }]}>
                {item.alert_type.replace(/_/g, ' ')}
              </Text>
              <Text style={styles.message}>{item.message}</Text>
            </View>
            <View style={styles.actionContainer}>
              <Text style={styles.time}>{new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
              {item.is_resolved ? (
                <Text style={styles.resolvedText}>✓ Resolved</Text>
              ) : (
                <TouchableOpacity onPress={() => markResolved(item.id)}>
                  <Text style={styles.markResolvedText}>Mark Resolved</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { padding: 16, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a202c' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 1 },
  activeCard: { borderLeftWidth: 4, borderLeftColor: '#fc8181' },
  resolvedCard: { borderLeftWidth: 4, borderLeftColor: '#cbd5e0', opacity: 0.7 },
  iconContainer: { width: 40, alignItems: 'center', justifyContent: 'center' },
  contentContainer: { flex: 1, paddingHorizontal: 8 },
  drainDeviceText: { fontSize: 14, color: '#2d3748', marginBottom: 2 },
  alertType: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  message: { fontSize: 13, color: '#4a5568' },
  actionContainer: { alignItems: 'flex-end', justifyContent: 'space-between', width: 90 },
  time: { fontSize: 10, color: '#a0aec0', textAlign: 'right' },
  resolvedText: { fontSize: 12, color: '#38a169', fontWeight: 'bold' },
  markResolvedText: { fontSize: 12, color: '#2b6cb0', fontWeight: 'bold' }
});
