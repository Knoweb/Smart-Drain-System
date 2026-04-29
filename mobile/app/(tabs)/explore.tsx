import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import MapView, { Marker } from '../../components/Map';

export default function MapScreen() {
  const [drains, setDrains] = useState<any[]>([]);

  useEffect(() => {
    const fetchDrains = async () => {
      const { data } = await supabase.from('drains').select('*, iot_devices(name, status)').not('latitude', 'is', null);
      if (data) setDrains(data);
    };
    fetchDrains();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drain Map</Text>
        <Text style={styles.subtitle}>Overview of drain pipelines</Text>
      </View>
      
      <View style={styles.mapContainer}>
        {drains.length > 0 && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: drains[0]?.latitude || 6.9271,
              longitude: drains[0]?.longitude || 79.8612,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {drains.map(drain => (
              <Marker
                key={`main-${drain.id}`}
                coordinate={{ latitude: drain.latitude, longitude: drain.longitude }}
                title={drain.name}
                pinColor={getPinColor(drain.status)}
              />
            ))}
          </MapView>
        )}
      </View>

      <ScrollView style={styles.detailsContainer} contentContainerStyle={styles.detailsScroll}>
        <Text style={styles.sectionTitle}>Detailed Device Locations</Text>
        <Text style={styles.sectionDesc}>Each drain site showing the precise location of its IoT sensor nodes.</Text>
        
        {drains.map(drain => (
          <View key={drain.id} style={[styles.drainCard, { borderTopColor: getHexColor(drain.status), borderTopWidth: 4 }]}>
            <View style={styles.miniMapContainer}>
              <MapView
                style={styles.miniMap}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                initialRegion={{
                  latitude: drain.latitude,
                  longitude: drain.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{ latitude: drain.latitude, longitude: drain.longitude }}
                  pinColor={getPinColor(drain.status)}
                />
              </MapView>
            </View>
            <View style={styles.drainCardInfo}>
              <View style={styles.drainCardHeader}>
                <Text style={styles.drainName}>{drain.name}</Text>
                <View style={[styles.badge, { borderColor: getHexColor(drain.status) }]}>
                  <Text style={[styles.badgeText, { color: getHexColor(drain.status) }]}>{drain.status}</Text>
                </View>
              </View>
              <Text style={styles.drainDetails}>
                Lat: {drain.latitude?.toFixed(5)}   Lng: {drain.longitude?.toFixed(5)}   Depth: {drain.baseline_depth_cm}cm
              </Text>
              
              <View style={styles.deviceList}>
                {drain.iot_devices?.map((dev: any) => (
                  <View key={dev.name} style={styles.deviceRow}>
                    <View style={styles.deviceLabel}>
                      <View style={[styles.dot, { backgroundColor: getHexColor(dev.status) }]} />
                      <Text style={styles.deviceName}>{dev.name}</Text>
                    </View>
                    <Text style={[styles.deviceStatus, { color: getHexColor(dev.status) }]}>{dev.status}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function getPinColor(status: string) {
  if (status === 'OPERATIONAL') return 'green';
  if (status === 'WARNING') return 'orange';
  if (status === 'CRITICAL') return 'red';
  return 'blue';
}

function getHexColor(status: string) {
  if (status === 'OPERATIONAL') return '#38a169';
  if (status === 'WARNING') return '#dd6b20';
  if (status === 'CRITICAL') return '#e53e3e';
  return '#718096';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { padding: 16, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a202c' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 2 },
  mapContainer: { height: '35%' },
  map: { width: '100%', height: '100%' },
  detailsContainer: { flex: 1, backgroundColor: '#f0f4f8' },
  detailsScroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748' },
  sectionDesc: { fontSize: 12, color: '#718096', marginBottom: 16, marginTop: 4 },
  drainCard: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, overflow: 'hidden', elevation: 2 },
  miniMapContainer: { height: 120, width: '100%' },
  miniMap: { width: '100%', height: '100%' },
  drainCardInfo: { padding: 12 },
  drainCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  drainName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  drainDetails: { fontSize: 12, color: '#718096', marginBottom: 12 },
  deviceList: { borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 8 },
  deviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  deviceLabel: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  deviceName: { fontSize: 12, color: '#4a5568' },
  deviceStatus: { fontSize: 10, fontWeight: 'bold' }
});
