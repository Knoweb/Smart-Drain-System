import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapComponent({ devices }: { devices: any[] }) {
  return (
    <MapView 
      style={styles.map}
      initialRegion={{
        latitude: devices[0]?.latitude || 40.7128,
        longitude: devices[0]?.longitude || -74.0060,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {devices.map((drain: any) => {
        let pinColor = 'green';
        if (drain.status === 'WARNING') pinColor = 'yellow';
        if (drain.status === 'CRITICAL') pinColor = 'red';

        return (
          <Marker
            key={drain.id}
            coordinate={{ latitude: drain.latitude, longitude: drain.longitude }}
            title={drain.name}
            description={`Status: ${drain.status}`}
            pinColor={pinColor}
          />
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
});
