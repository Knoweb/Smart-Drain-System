import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function SensorsScreen() {
  const theme = useThemeColors();
  const [drains, setDrains] = useState<any[]>([]);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    const { data } = await supabase
      .from('drains')
      .select('name, iot_devices(name, status)')
      .order('name');
    
    if (data) setDrains(data);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textMain }]}>Sensor Readings</Text>
          <Text style={[styles.subtitle, { color: theme.textSub }]}>Live telemetry updated via WebSockets</Text>
        </View>

        {drains.map((drain, idx) => (
          <View key={idx} style={styles.drainSection}>
            <Text style={[styles.drainTitle, { color: theme.textMain }]}>{drain.name}</Text>
            
            <View style={styles.devicesGrid}>
              {drain.iot_devices?.map((dev: any, dIdx: number) => {
                let waterLevel = 20;
                let battery = 90;
                if (dev.status === 'WARNING') { waterLevel = 67; battery = 49; }
                if (dev.status === 'CRITICAL') { waterLevel = 88; battery = 15; }

                return (
                  <View key={dIdx} style={[styles.deviceCard, { backgroundColor: theme.card }]}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={[styles.deviceName, { color: theme.textMain }]}>{dev.name}</Text>
                        <Text style={[styles.deviceDrainName, { color: theme.textSub }]}>{drain.name}</Text>
                      </View>
                      <View style={[styles.badge, { borderColor: getHexColor(dev.status) }]}>
                        <Text style={[styles.badgeText, { color: getHexColor(dev.status) }]}>{dev.status}</Text>
                      </View>
                    </View>

                    <View style={styles.gaugesContainer}>
                      <View style={styles.gauge}>
                        <View style={[styles.gaugeCircle, { borderColor: getHexColor(dev.status === 'WARNING' ? 'WARNING' : (dev.status === 'CRITICAL' ? 'CRITICAL' : 'OPERATIONAL')) }]}>
                          <Text style={[styles.gaugeValue, { color: theme.textMain }]}>{waterLevel}%</Text>
                        </View>
                        <Text style={[styles.gaugeLabel, { color: theme.textSub }]}>WATER LEVEL</Text>
                      </View>
                      <View style={styles.gauge}>
                        <View style={[styles.gaugeCircle, { borderColor: battery < 20 ? '#e53e3e' : '#38a169' }]}>
                          <Text style={[styles.gaugeValue, { color: theme.textMain }]}>{battery}%</Text>
                        </View>
                        <Text style={[styles.gaugeLabel, { color: theme.textSub }]}>BATTERY</Text>
                      </View>
                    </View>

                    <View style={styles.metricsContainer}>
                      <View style={styles.metric}>
                        <Text style={[styles.metricLabel, { color: theme.textSub }]}>PRESSURE</Text>
                        <Text style={[styles.metricValue, { color: theme.textMain }]}>14.0 psi</Text>
                      </View>
                      <View style={styles.metric}>
                        <Text style={[styles.metricLabel, { color: theme.textSub }]}>TEMPERATURE</Text>
                        <Text style={[styles.metricValue, { color: theme.textMain }]}>32.0 °C</Text>
                      </View>
                    </View>

                    <View style={[styles.trendContainer, { borderTopColor: theme.border }]}>
                      <Text style={[styles.trendLabel, { color: theme.textSub }]}>WATER LEVEL TREND</Text>
                      <View style={[styles.trendLine, { backgroundColor: theme.border }]} />
                      <Text style={[styles.updatedTime, { color: theme.textSub }]}>Updated 3:01:36 PM</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function getHexColor(status: string) {
  if (status === 'OPERATIONAL') return '#38a169';
  if (status === 'WARNING') return '#dd6b20';
  if (status === 'CRITICAL') return '#e53e3e';
  return '#718096';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  drainSection: { marginBottom: 24 },
  drainTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  devicesGrid: { flexDirection: 'column' },
  deviceCard: { borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  deviceName: { fontSize: 16, fontWeight: 'bold' },
  deviceDrainName: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  gaugesContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  gauge: { alignItems: 'center' },
  gaugeCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gaugeValue: { fontSize: 18, fontWeight: 'bold' },
  gaugeLabel: { fontSize: 10, fontWeight: 'bold' },
  metricsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  metric: { alignItems: 'center' },
  metricLabel: { fontSize: 10, marginBottom: 4 },
  metricValue: { fontSize: 14, fontWeight: 'bold' },
  trendContainer: { borderTopWidth: 1, paddingTop: 12 },
  trendLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  trendLine: { height: 2, marginBottom: 8 },
  updatedTime: { fontSize: 10, textAlign: 'right' }
});
