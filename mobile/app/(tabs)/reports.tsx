import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';

export default function ReportsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>Export historical sensor data as CSV or PDF</Text>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownLabel}>TIME RANGE</Text>
              <Text style={styles.dropdownValue}>Last 24 Hours ▾</Text>
            </View>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownLabel}>IOT DEVICE</Text>
              <Text style={styles.dropdownValue}>All Devices ▾</Text>
            </View>
          </View>
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.exportBtn}>
              <Text style={styles.exportBtnText}>↓ Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn}>
              <Text style={styles.exportBtnText}>📄 Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sensor Trends — Last 24 Hours</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No readings available for the selected filters.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Summary (0 records)</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No readings found for the selected filters.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a202c' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  filterSection: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dropdown: { flex: 1, marginRight: 8 },
  dropdownLabel: { fontSize: 10, fontWeight: 'bold', color: '#a0aec0', marginBottom: 4 },
  dropdownValue: { fontSize: 14, color: '#2d3748', padding: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  exportBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f7fafc', marginLeft: 8 },
  exportBtnText: { fontSize: 14, color: '#4a5568', fontWeight: '500' },
  card: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2d3748', marginBottom: 24 },
  emptyState: { height: 100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#a0aec0' }
});
