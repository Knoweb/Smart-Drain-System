import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function MapComponent({ devices }: { devices: any[] }) {
  return (
    <View style={styles.webContainer}>
      <Text style={styles.webText}>🗺️ Native Map View</Text>
      <Text style={styles.webSubText}>Please open this Expo app on an iOS or Android device to view the hardware map.</Text>
      <Text style={styles.webSubText}>For web monitoring, please use your primary React web dashboard.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f0f4f8' },
  webText: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1a202c' },
  webSubText: { fontSize: 16, textAlign: 'center', color: '#4a5568', marginTop: 8 }
});
