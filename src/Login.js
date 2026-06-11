import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Mohon isi email dan password Anda.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post('https://swiftness-shifter-promotion.ngrok-free.dev/api/login', {
        email: email,
        password: password
      });

      const token = response.data.access_token || response.data.token || response.data.data?.access_token || response.data.data?.token;
      const user = response.data.user || response.data.data?.user;
      const namaUser = user?.name || "Pengguna";
      
      let role = 'customer'; 
      if (user?.role === 'admin' || user?.is_admin === true || user?.role === 'Admin') {
        role = 'admin';
      }

      if (token) {
        await AsyncStorage.setItem('auth_token', String(token));
        await AsyncStorage.setItem('user_name', String(namaUser));
        await AsyncStorage.setItem('user_role', String(role));

        if (role === 'admin') {
          router.replace('/admin');      
        } else {
          router.replace('/dashboard');  
        }
      } else {
        Alert.alert('Gagal Membaca Data', 'Format Token tidak dikenali.');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Gagal Login', 'Email atau Password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* --- BAGIAN LOGO & HEADER --- */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBox}>
              <FontAwesome5 name="motorcycle" size={32} color="#ffffff" />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.titleTop}>MJ MOTO<Text style={styles.titleBottom}>PERFORMANCE</Text></Text>
            </View>
            <Text style={styles.subtitle}>Akses Dasbor Sistem Bengkel Anda</Text>
          </View>

          {/* --- BAGIAN FORMULIR --- */}
          <View style={styles.cardContainer}>
            
            {/* Input Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Akses</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="envelope" size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Masukkan email Anda" 
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Input Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="lock" size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="••••••••" 
                  placeholderTextColor="#475569"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Link Lupa Password (Aktif) */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => router.push('/forgot-password')} 
            >
              <Text style={styles.forgotPasswordText}>Lupa password?</Text>
            </TouchableOpacity>

            {/* Tombol Login */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome5 name="sign-in-alt" size={16} color="white" style={{ marginRight: 10 }} />
                  <Text style={styles.loginButtonText}>Masuk Garasi</Text>
                </>
              )}
            </TouchableOpacity>

            {/* --- LINK KE REGISTER --- */}
            <View style={styles.registerFooter}>
              <Text style={styles.registerText}>Belum punya akun?</Text>
              <TouchableOpacity onPress={() => router.replace('/register')}>
                <Text style={styles.registerLink}>Daftar di sini</Text>
              </TouchableOpacity>
            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- DESAIN UI (STYLES) LOGIN MODERN ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a' // bg-slate-900 (Konsisten dengan web)
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  
  // Header Logo
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#dc2626', // bg-red-600
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ rotate: '-3deg' }] // Efek miring sedikit seperti di web
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  titleTop: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#ef4444', // text-red-500
    letterSpacing: 2, 
    textAlign: 'center' 
  },
  titleBottom: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#ffffff', // text-white
    letterSpacing: 2, 
  },
  subtitle: { 
    color: '#94a3b8', // text-slate-400
    fontSize: 14, 
    fontWeight: '500' 
  },
  
  // Card Area
  cardContainer: { 
    backgroundColor: 'rgba(30, 41, 59, 0.7)', // bg-slate-800 dengan transparansi
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)', // border-slate-700
  },
  
  inputWrapper: {
    marginBottom: 20
  },
  label: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#94a3b8', // text-slate-400
    marginBottom: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // bg-slate-900/50
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155', // border-slate-700
    paddingHorizontal: 16,
    height: 56
  },
  inputIcon: { 
    marginRight: 12, 
    width: 20, 
    textAlign: 'center' 
  },
  input: { 
    flex: 1, 
    color: '#ffffff', 
    fontSize: 15,
  },

  // Forgot Password
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -8
  },
  forgotPasswordText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },

  // Tombol Login Solid Red Gradient feel
  loginButton: { 
    flexDirection: 'row',
    backgroundColor: '#dc2626', // bg-red-600
    paddingVertical: 16, 
    borderRadius: 12, 
    justifyContent: 'center',
    alignItems: 'center', 
    shadowColor: '#ef4444', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  loginButtonDisabled: {
    backgroundColor: '#f87171'
  },
  loginButtonText: { 
    color: '#ffffff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },

  // Footer Register
  registerFooter: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28, 
    paddingTop: 24, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(51, 65, 85, 0.5)', // border-slate-700/50
    gap: 6
  },
  registerText: { 
    color: '#94a3b8', 
    fontSize: 14 
  },
  registerLink: { 
    color: '#f87171', // text-red-400
    fontSize: 14, 
    fontWeight: 'bold' 
  }
});