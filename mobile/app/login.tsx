import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../hooks/useThemeColors';
import { IconSymbol } from '../components/ui/icon-symbol';

export default function LoginScreen() {
  const theme = useThemeColors();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    let error;
    
    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
      error = signUpError;
      if (!error) {
        Alert.alert('Success', 'Account created! Please sign in.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    }

    setLoading(false);

    if (error) {
      Alert.alert('Authentication Failed', error.message);
    } else if (isLogin) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.isDark ? theme.bg : '#e6f3fb' }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <View style={styles.logoShadow}>
              <Image 
                source={require('../assets/images/logo.jpeg')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
            </View>
            <Text style={[styles.title, { color: theme.isDark ? theme.textMain : '#234a94' }]}>
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSub }]}>
              {isLogin ? 'Sign in to access your dashboard.' : 'Sign up to monitor telemetry data.'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <>
                <Text style={[styles.label, { color: theme.isDark ? theme.textMain : '#234a94' }]}>Username</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.isDark ? theme.border : '#a5c8fb', color: theme.textMain }]}
                  placeholder="johndoe"
                  placeholderTextColor={theme.textSub}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </>
            )}

            <Text style={[styles.label, { color: theme.isDark ? theme.textMain : '#234a94' }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.isDark ? theme.border : '#a5c8fb', color: theme.textMain }]}
              placeholder="admin@smartdrain.com"
              placeholderTextColor={theme.textSub}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={[styles.label, { color: theme.isDark ? theme.textMain : '#234a94' }]}>Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: theme.card, borderColor: theme.isDark ? theme.border : '#a5c8fb' }]}>
              <TextInput
                style={[styles.passwordInput, { color: theme.textMain }]}
                placeholder="********"
                placeholderTextColor={theme.textSub}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <IconSymbol name={showPassword ? "eye.slash.fill" : "eye.fill"} size={20} color={theme.textSub} />
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <>
                <Text style={[styles.label, { color: theme.isDark ? theme.textMain : '#234a94' }]}>Confirm Password</Text>
                <View style={[styles.passwordContainer, { backgroundColor: theme.card, borderColor: theme.isDark ? theme.border : '#a5c8fb' }]}>
                  <TextInput
                    style={[styles.passwordInput, { color: theme.textMain }]}
                    placeholder="********"
                    placeholderTextColor={theme.textSub}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <IconSymbol name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"} size={20} color={theme.textSub} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}</Text>
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
              <Text style={{ color: theme.textSub, fontSize: 14 }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.toggleText}>{isLogin ? "Sign Up" : "Log In"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  logoShadow: { elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, borderRadius: 8, marginBottom: 20 },
  logo: { width: 300, height: 85, borderRadius: 8 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center' },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 6, marginLeft: 4 },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, marginBottom: 16 },
  passwordInput: { flex: 1, padding: 14, fontSize: 16 },
  eyeIcon: { padding: 14 },
  button: { backgroundColor: '#344b7a', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  toggleText: { color: '#1a56db', fontSize: 14, fontWeight: 'bold' }
});
