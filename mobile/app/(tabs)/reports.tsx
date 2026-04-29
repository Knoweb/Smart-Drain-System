import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, Modal, Share, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ReportsScreen() {
  const theme = useThemeColors();
  const [readings, setReadings] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  const [selectedDevice, setSelectedDevice] = useState('All Devices');
  
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [timeRange, selectedDevice]);

  const fetchDevices = async () => {
    const { data } = await supabase.from('iot_devices').select('id, name, drains(name)');
    if (data) setDevices(data);
  };

  const fetchReadings = async () => {
    let query = supabase.from('sensor_readings').select('*, iot_devices(name, drains(name))').order('recorded_at', { ascending: false });
    
    if (timeRange === 'Last 24 Hours') {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      query = query.gte('recorded_at', yesterday.toISOString());
    } else if (timeRange === 'Last 7 Days') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      query = query.gte('recorded_at', lastWeek.toISOString());
    }

    if (selectedDevice !== 'All Devices') {
      const dev = devices.find(d => d.name === selectedDevice);
      if (dev) query = query.eq('device_id', dev.id);
    }

    const { data } = await query;
    if (data) setReadings(data);
  };

  const handleExportCSV = async () => {
    if (readings.length === 0) {
      Alert.alert('Empty', 'No data to export.');
      return;
    }

    const headers = ['Date', 'Drain Name', 'Device Name', 'Water Level (%)', 'Pressure (PSI)', 'Temperature (C)', 'Battery (%)'];
    const rows = readings.map(r => [
      new Date(r.recorded_at).toLocaleString(),
      r.iot_devices?.drains?.name ?? 'Unknown',
      r.iot_devices?.name ?? 'Unknown',
      r.water_level_pct,
      r.water_pressure_psi ?? '',
      r.temperature_c ?? '',
      r.battery_level_pct ?? ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    try {
      await Share.share({
        message: csvContent,
        title: 'Exported Data CSV'
      });
    } catch (error: any) {
      Alert.alert('Export Failed', error.message);
    }
  };

  const handleExportPDF = () => {
    if (readings.length === 0) {
      Alert.alert('Empty', 'No data to export.');
      return;
    }
    Alert.alert('Export PDF', 'PDF Export requires external libraries on mobile. Please use CSV Export or export via the web dashboard.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textMain }]}>Reports</Text>
          <Text style={[styles.subtitle, { color: theme.textSub }]}>Export historical sensor data as CSV or PDF</Text>
        </View>

        <View style={[styles.filterSection, { backgroundColor: theme.card }]}>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowTimeModal(true)}>
              <Text style={[styles.dropdownLabel, { color: theme.textSub }]}>TIME RANGE</Text>
              <Text style={[styles.dropdownValue, { color: theme.textMain, borderColor: theme.border }]}>{timeRange} ▾</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowDeviceModal(true)}>
              <Text style={[styles.dropdownLabel, { color: theme.textSub }]}>IOT DEVICE</Text>
              <Text style={[styles.dropdownValue, { color: theme.textMain, borderColor: theme.border }]}>{selectedDevice} ▾</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.exportBtn, { backgroundColor: theme.activeBtn, borderColor: theme.border }]} onPress={handleExportCSV}>
              <Text style={[styles.exportBtnText, { color: theme.textMain }]}>↓ Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportBtn, { backgroundColor: theme.activeBtn, borderColor: theme.border }]} onPress={handleExportPDF}>
              <Text style={[styles.exportBtnText, { color: theme.textMain }]}>📄 Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.textMain }]}>Data Summary ({readings.length} records)</Text>
          {readings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSub }]}>No readings found for the selected filters.</Text>
            </View>
          ) : (
            <View style={styles.summaryContainer}>
               <Text style={[styles.summaryText, { color: theme.textMain }]}>First reading: {new Date(readings[readings.length - 1].recorded_at).toLocaleString()}</Text>
               <Text style={[styles.summaryText, { color: theme.textMain }]}>Last reading: {new Date(readings[0].recorded_at).toLocaleString()}</Text>
               <Text style={[styles.summaryText, { color: theme.textMain }]}>Total Data Points: {readings.length}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Time Modal */}
      <Modal visible={showTimeModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textMain }]}>Select Time Range</Text>
            {['Last 24 Hours', 'Last 7 Days', 'All Time'].map(opt => (
              <TouchableOpacity key={opt} style={[styles.modalOpt, { borderBottomColor: theme.border }]} onPress={() => { setTimeRange(opt); setShowTimeModal(false); }}>
                <Text style={[styles.modalOptText, { color: theme.textMain }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowTimeModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Device Modal */}
      <Modal visible={showDeviceModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textMain }]}>Select IoT Device</Text>
            <ScrollView style={{maxHeight: 300}}>
              <TouchableOpacity style={[styles.modalOpt, { borderBottomColor: theme.border }]} onPress={() => { setSelectedDevice('All Devices'); setShowDeviceModal(false); }}>
                <Text style={[styles.modalOptText, { color: theme.textMain }]}>All Devices</Text>
              </TouchableOpacity>
              {devices.map(d => (
                <TouchableOpacity key={d.id} style={[styles.modalOpt, { borderBottomColor: theme.border }]} onPress={() => { setSelectedDevice(d.name); setShowDeviceModal(false); }}>
                  <Text style={[styles.modalOptText, { color: theme.textMain }]}>{d.name} ({d.drains?.name})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowDeviceModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  filterSection: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dropdown: { flex: 1, marginRight: 8 },
  dropdownLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  dropdownValue: { fontSize: 14, padding: 10, borderWidth: 1, borderRadius: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  exportBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, marginLeft: 8 },
  exportBtnText: { fontSize: 14, fontWeight: '500' },
  card: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 24 },
  emptyState: { height: 100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14 },
  summaryContainer: { paddingTop: 10 },
  summaryText: { fontSize: 14, marginBottom: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalOpt: { paddingVertical: 12, borderBottomWidth: 1 },
  modalOptText: { fontSize: 16 },
  modalCancel: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { fontSize: 16, fontWeight: 'bold', color: '#e53e3e' }
});
