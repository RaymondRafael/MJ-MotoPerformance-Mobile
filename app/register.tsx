import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterMobile() {
  const router = useRouter();

  // State Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(''); 
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = 'https://swiftness-shifter-promotion.ngrok-free.dev/api';

  const handleRegister = async () => {
    if (!name || !email || !phone || !address || !password) {
      return Alert.alert('Perhatian', 'Semua kolom wajib diisi, termasuk alamat!');
    }
    if (password !== passwordConfirm) {
      return Alert.alert('Perhatian', 'Konfirmasi password tidak cocok!');
    }
    if (password.length < 6) {
      return Alert.alert('Perhatian', 'Password minimal 6 karakter!');
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/register`, {
        name: name,
        email: email,
        phone_number: phone,
        address: address, 
        password: password,
        password_confirmation: passwordConfirm 
      });

      const responseData = response.data.data;
      await AsyncStorage.setItem('auth_token', responseData.token);
      await AsyncStorage.setItem('user_role', responseData.user.role);
      await AsyncStorage.setItem('user_name', responseData.user.name);

      Alert.alert(
        'Pendaftaran Berhasil!', 
        'Selamat datang di MJ MotoPerformance!',
        [{ 
          text: 'Masuk Garasi', 
          onPress: () => router.replace('/dashboard') 
        }] 
      );
      
    } catch (err) {
      console.error(err);
      let errorMsg = 'Gagal mendaftar. Pastikan email atau nomor HP belum terdaftar.';
      
      if (axios.isAxiosError(err) && err.response) {
         errorMsg = err.response.data?.message || errorMsg;
      }
      
      Alert.alert('Pendaftaran Gagal', errorMsg);
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
              <FontAwesome5 name="user-plus" size={28} color="#ffffff" />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.titleTop}>MJ MOTO<Text style={styles.titleBottom}>PERFORMANCE</Text></Text>
            </View>
            <Text style={styles.subtitle}>Buat Akun Pelanggan Baru</Text>
          </View>

          {/* --- BAGIAN FORMULIR (Glass Card) --- */}
          <View style={styles.cardContainer}>
            
            {/* Input Nama */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="user" size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Masukkan nama Anda"
                  placeholderTextColor="#475569"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Input Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Alamat Email</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="envelope" size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="contoh@email.com"
                  placeholderTextColor="#475569"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Input Nomor HP */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Nomor WhatsApp</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="whatsapp" size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="0812xxxx"
                  placeholderTextColor="#475569"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Input Alamat (Multiline) */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Alamat Domisili</Text>
              <View style={[styles.inputGroup, styles.addressGroup]}>
                <FontAwesome5 name="home" size={14} color="#64748b" style={[styles.inputIcon, styles.addressIcon]} />
                <TextInput 
                  style={[styles.input, styles.addressInput]}
                  placeholder="Masukkan alamat lengkap..."
                  placeholderTextColor="#475569"
                  multiline={true}
                  numberOfLines={3}
                  value={address}
                  onChangeText={setAddress}
                  textAlignVertical="top"
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
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#475569"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.7}>
                  <FontAwesome5 name={showPassword ? "eye-slash" : "eye"} size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Konfirmasi Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Ulangi Password</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="check-circle" size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Pastikan password cocok"
                  placeholderTextColor="#475569"
                  secureTextEntry={!showPassword}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                />
              </View>
            </View>

            {/* Tombol Daftar */}
            <TouchableOpacity 
              style={[styles.btnPrimary, isLoading && styles.btnPrimaryDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <FontAwesome5 name="paper-plane" size={16} color="white" style={{ marginRight: 10 }} />
                  <Text style={styles.btnPrimaryText}>Daftar Sekarang</Text>
                </>
              )}
            </TouchableOpacity>

            {/* --- LINK KE LOGIN --- */}
            <View style={styles.loginFooter}>
              <Text style={styles.loginText}>Sudah punya akun?</Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginLink}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- DESAIN UI (STYLES) REGISTER MODERN ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a' // bg-slate-900 (Konsisten dengan Login & Welcome)
  }, 
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    paddingVertical: 40 
  },
  
  // Header Logo
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 32 
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
    transform: [{ rotate: '-3deg' }] // Efek miring
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  titleTop: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#ef4444', 
    letterSpacing: 2, 
    textAlign: 'center' 
  },
  titleBottom: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#ffffff', 
    letterSpacing: 2, 
  },
  subtitle: { 
    color: '#94a3b8', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  
  // Form Area (Glass Card)
  cardContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)', // bg-slate-800/70
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)', // border-slate-700/50
    marginBottom: 20
  },
  inputWrapper: {
    marginBottom: 18
  },
  label: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#94a3b8', 
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
    fontSize: 15 
  },
  eyeIcon: { 
    padding: 10,
    marginRight: -10 
  },
  
  // Khusus Alamat Multiline
  addressGroup: { 
    height: 100, 
    alignItems: 'flex-start' 
  },
  addressInput: { 
    height: 90, 
    paddingTop: 16 
  },
  addressIcon: {
    marginTop: 18
  },

  // Tombol Solid
  btnPrimary: { 
    flexDirection: 'row',
    backgroundColor: '#dc2626', 
    paddingVertical: 16, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10, 
    shadowColor: '#ef4444', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  btnPrimaryDisabled: {
    backgroundColor: '#f87171'
  },
  btnPrimaryText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  // Footer Login (Konsisten dengan LoginScreen)
  loginFooter: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28, 
    paddingTop: 24, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(51, 65, 85, 0.5)', 
    gap: 6
  },
  loginText: { 
    color: '#94a3b8', 
    fontSize: 14 
  },
  loginLink: { 
    color: '#f87171', 
    fontSize: 14, 
    fontWeight: 'bold' 
  } 
});