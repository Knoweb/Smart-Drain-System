import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    alert('You have been signed out.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Profile</Text>
        <Text style={styles.cardDesc}>You are currently monitoring the Smart Drain infrastructure network.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <Text style={styles.cardDesc}>Push Notifications are active for this device via Expo servers.</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1a202c', marginTop: 40 },
  card: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#4a5568', lineHeight: 20 },
  signOutButton: { backgroundColor: '#e53e3e', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  signOutText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});
