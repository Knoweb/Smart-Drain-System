import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function DashboardScreen() {
  const [drains, setDrains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrains();
  }, []);

  const fetchDrains = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('drains')
      .select('*, iot_devices(status)')
      .order('name');
    if (data) setDrains(data);
    setLoading(false);
  };

  const total = drains.length;
  const operational = drains.filter(d => d.status === 'OPERATIONAL').length;
  const warning = drains.filter(d => d.status === 'WARNING').length;
  const critical = drains.filter(d => d.status === 'CRITICAL').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Overview</Text>
          <Text style={styles.subtitle}>Real-time summary of all drain sensors</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3182ce" style={{ marginTop: 20 }} />
        ) : (
          <>
            <View style={styles.grid}>
              <StatCard label="TOTAL DRAINS" value={total} sub="Monitored sites" color="#3182ce" />
              <StatCard label="OPERATIONAL" value={operational} sub="Running normally" color="#38a169" />
              <StatCard label="WARNING" value={warning} sub="Needs attention" color="#dd6b20" />
              <StatCard label="CRITICAL" value={critical} sub="Immediate action required" color="#e53e3e" />
            </View>

            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>System Status</Text>
              <View style={styles.progressBar}>
                {total > 0 && (
                  <>
                    <View style={[styles.progressSegment, { flex: operational, backgroundColor: '#38a169' }]} />
                    <View style={[styles.progressSegment, { flex: warning, backgroundColor: '#dd6b20' }]} />
                    <View style={[styles.progressSegment, { flex: critical, backgroundColor: '#e53e3e' }]} />
                  </>
                )}
              </View>
              <View style={styles.legend}>
                <LegendItem label="Operational" count={operational} color="#38a169" />
                <LegendItem label="Warning" count={warning} color="#dd6b20" />
                <LegendItem label="Critical" count={critical} color="#e53e3e" />
              </View>
            </View>

            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Drain Locations</Text>
              {drains.map(drain => (
                <View key={drain.id} style={styles.listItem}>
                  <View style={styles.listRow}>
                    <Text style={styles.listName}>{drain.name}</Text>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(drain.status) }]}>
                      <Text style={styles.badgeText}>{drain.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.listSub}>Devices: {drain.iot_devices?.length || 0} | Lat: {drain.latitude?.toFixed(4)} | Lng: {drain.longitude?.toFixed(4)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, sub, color }: any) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 4 }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function LegendItem({ label, count, color }: any) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}: <Text style={{ fontWeight: 'bold' }}>{count}</Text></Text>
    </View>
  );
}

function getStatusColor(status: string) {
  if (status === 'OPERATIONAL') return '#38a169';
  if (status === 'WARNING') return '#dd6b20';
  if (status === 'CRITICAL') return '#e53e3e';
  return '#718096';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20, marginTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a202c' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { backgroundColor: '#fff', width: '48%', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 4 },
  statSub: { fontSize: 10, color: '#a0aec0' },
  cardSection: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginTop: 12, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2d3748', marginBottom: 12 },
  progressBar: { height: 16, borderRadius: 8, flexDirection: 'row', overflow: 'hidden', marginBottom: 12, backgroundColor: '#edf2f7' },
  progressSegment: { height: '100%' },
  legend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendLabel: { fontSize: 12, color: '#4a5568' },
  listItem: { borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingVertical: 12 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  listSub: { fontSize: 12, color: '#718096' }
});
