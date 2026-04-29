import React from 'react';
import { View, Text } from 'react-native';

export default function MapView({ style }: any) {
  return (
    <View style={[style, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: '#718096', fontWeight: 'bold' }}>Map is not supported on Web</Text>
      <Text style={{ color: '#a0aec0', fontSize: 12, marginTop: 4 }}>Please use a mobile device or emulator</Text>
    </View>
  );
}

export function Marker() {
  return null;
}
