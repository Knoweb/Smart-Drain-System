import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, Switch, Appearance, Platform, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function SettingsScreen() {
  const theme = useThemeColors();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleTheme = (value: boolean) => {
    if (Platform.OS === 'web') {
      alert("Theme toggling is currently only supported on mobile devices (iOS/Android).");
      return;
    }
    try {
      Appearance.setColorScheme(value ? 'dark' : 'light');
    } catch (e) {
      console.log('setColorScheme error:', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textMain }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSub }]}>Configure system preferences and alerts</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textMain }]}>Appearance Options</Text>
              <Text style={[styles.cardDesc, { color: theme.textSub }]}>Toggle between light and dark modes. Dark mode is recommended for monitoring dashboards.</Text>
            </View>
            <View style={[styles.switchContainer, { backgroundColor: theme.bg }]}>
              <Text style={[styles.switchText, { color: theme.textMain }]}>{theme.isDark ? 'Dark' : 'Light'}</Text>
              <Switch value={theme.isDark} onValueChange={toggleTheme} />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textMain }]}>Alert Thresholds</Text>
              <Text style={[styles.cardDesc, { color: theme.textSub }]}>Set the water level percentages for Warning and Critical alerts.</Text>
            </View>
            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: theme.activeBtn, borderColor: theme.border }]}>
              <Text style={[styles.secondaryButtonText, { color: theme.textMain }]}>Configure Limits (Coming soon)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textMain }]}>Notification Preferences</Text>
              <Text style={[styles.cardDesc, { color: theme.textSub }]}>Manage email and SMS alerts for critical drain events.</Text>
            </View>
            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: theme.activeBtn, borderColor: theme.border }]}>
              <Text style={[styles.secondaryButtonText, { color: theme.textMain }]}>Manage Notifications</Text>
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
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  cardHeaderRow: { flexDirection: 'column' },
  cardTextCol: { marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { fontSize: 14, lineHeight: 20 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  switchText: { marginRight: 8, fontSize: 14, fontWeight: 'bold' },
  secondaryButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  secondaryButtonText: { fontSize: 14, fontWeight: '500' },
  signOutButton: { backgroundColor: '#e53e3e', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  signOutText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});
