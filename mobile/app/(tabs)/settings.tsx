import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure system preferences and alerts</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Appearance Options</Text>
              <Text style={styles.cardDesc}>Toggle between light and dark modes. Dark mode is recommended for monitoring dashboards.</Text>
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>{isDarkMode ? 'Dark' : 'Light'}</Text>
              <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Alert Thresholds</Text>
              <Text style={styles.cardDesc}>Set the water level percentages for Warning and Critical alerts.</Text>
            </View>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Configure Limits (Coming soon)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Notification Preferences</Text>
              <Text style={styles.cardDesc}>Manage email and SMS alerts for critical drain events.</Text>
            </View>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Manage Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a202c' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  card: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  cardHeaderRow: { flexDirection: 'column' },
  cardTextCol: { marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#718096', lineHeight: 20 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  switchText: { marginRight: 8, fontSize: 14, fontWeight: 'bold', color: '#4a5568' },
  secondaryButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  secondaryButtonText: { fontSize: 14, color: '#4a5568', fontWeight: '500' },
  signOutButton: { backgroundColor: '#e53e3e', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  signOutText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});
