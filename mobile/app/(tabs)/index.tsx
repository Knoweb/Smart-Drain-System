import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function DashboardScreen() {
  const theme = useThemeColors();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textMain }]}>Overview</Text>
          <Text style={[styles.subtitle, { color: theme.textSub }]}>Real-time summary of all drain sensors</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3182ce" style={{ marginTop: 20 }} />
        ) : (
          <>
            <View style={styles.grid}>
              <StatCard label="TOTAL DRAINS" value={total} sub="Monitored sites" color="#3182ce" theme={theme} />
              <StatCard label="OPERATIONAL" value={operational} sub="Running normally" color="#38a169" theme={theme} />
              <StatCard label="WARNING" value={warning} sub="Needs attention" color="#dd6b20" theme={theme} />
              <StatCard label="CRITICAL" value={critical} sub="Immediate action required" color="#e53e3e" theme={theme} />
            </View>

            <View style={[styles.cardSection, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.textMain }]}>System Status</Text>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                {total > 0 && (
                  <>
                    <View style={[styles.progressSegment, { flex: operational, backgroundColor: '#38a169' }]} />
                    <View style={[styles.progressSegment, { flex: warning, backgroundColor: '#dd6b20' }]} />
                    <View style={[styles.progressSegment, { flex: critical, backgroundColor: '#e53e3e' }]} />
                  </>
                )}
              </View>
              <View style={styles.legend}>
                <LegendItem label="Operational" count={operational} color="#38a169" theme={theme} />
                <LegendItem label="Warning" count={warning} color="#dd6b20" theme={theme} />
                <LegendItem label="Critical" count={critical} color="#e53e3e" theme={theme} />
              </View>
            </View>

            <View style={[styles.cardSection, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Drain Locations</Text>
              {drains.map(drain => (
                <View key={drain.id} style={[styles.listItem, { borderBottomColor: theme.border }]}>
                  <View style={styles.listRow}>
                    <Text style={[styles.listName, { color: theme.textMain }]}>{drain.name}</Text>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(drain.status) }]}>
                      <Text style={styles.badgeText}>{drain.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.listSub, { color: theme.textSub }]}>Devices: {drain.iot_devices?.length || 0} | Lat: {drain.latitude?.toFixed(4)} | Lng: {drain.longitude?.toFixed(4)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, sub, color, theme }: any) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 4, backgroundColor: theme.card }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMain }]}>{label}</Text>
      <Text style={[styles.statSub, { color: theme.textSub }]}>{sub}</Text>
    </View>
  );
}

function LegendItem({ label, count, color, theme }: any) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: theme.textMain }]}>{label}: <Text style={{ fontWeight: 'bold' }}>{count}</Text></Text>
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
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20, marginTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  statSub: { fontSize: 10 },
  cardSection: { padding: 16, borderRadius: 12, marginTop: 12, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  progressBar: { height: 16, borderRadius: 8, flexDirection: 'row', overflow: 'hidden', marginBottom: 12 },
  progressSegment: { height: '100%' },
  legend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendLabel: { fontSize: 12 },
  listItem: { borderBottomWidth: 1, paddingVertical: 12 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listName: { fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  listSub: { fontSize: 12 }
});
