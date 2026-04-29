import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import MapComponent from '../../components/MapComponent';

export default function MapScreen() {
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      const { data } = await supabase.from('drains').select('*').not('latitude', 'is', null);
      if (data) setDevices(data);
    };
    fetchDevices();
  }, []);

  return (
    <View style={styles.container}>
      <MapComponent devices={devices} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
