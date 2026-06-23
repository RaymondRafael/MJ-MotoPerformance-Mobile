import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

export default function ResetPasswordScreen() {
  const router = useRouter();
  
  // Tangkap parameter dari URL Deep Link
  // Menggunakan TypeScript untuk mendefinisikan tipe kembalian
  const { token, email: emailFromUrl } = useLocalSearchParams<{ token: string; email: string }>(); 

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    // 1. Validasi Input Kosong
    if (!password || !confirmPassword) {
      Alert.alert('Peringatan', 'Silakan isi kedua kolom password.');
      return;
    }

    // 2. Validasi Kecocokan Password
    if (password !== confirmPassword) {
      Alert.alert('Gagal', 'Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    // 3. Validasi Keberadaan Token & Email dari Link
    if (!token || !emailFromUrl) {
      Alert.alert('Akses Ditolak', 'Token atau Email tidak valid. Pastikan Anda membuka link dari email terbaru.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('https://swiftness-shifter-promotion.ngrok-free.dev/api/reset-password', {
        email: emailFromUrl,
        password: password,
        password_confirmation: confirmPassword,
        token: token
      });

      if (response.data.success) {
        Alert.alert(
          'Berhasil!',
          'Password Anda telah berhasil diubah. Silakan login kembali dengan password baru Anda.',
          [
            { text: 'Masuk Sekarang', onPress: () => router.replace('/login') }
          ]
        );
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Gagal mengubah password. Token mungkin sudah kedaluwarsa.';
      Alert.alert('Gagal', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Blobs (Dekorasi) */}
      <View style={[styles.blob, styles.blobRed, { top: -50, left: -50 }]} />
      <View style={[styles.blob, styles.blobOrange, { top: -20, right: -50 }]} />
      <View style={[styles.blob, styles.blobDarkRed, { bottom: -50, left: 50 }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          {/* Header & Icon */}
          <View style={styles.headerContainer}>
            <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.iconBox}>
              <FontAwesome5 name="unlock-alt" size={28} color="white" />
            </LinearGradient>
            <Text style={styles.title}>BUAT PASSWORD BARU</Text>
            <Text style={styles.subtitle}>
              Silakan masukkan kata sandi baru yang kuat untuk akun Anda.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            
            {/* Input Email (Readonly dari Parameter URL) */}
            <Text style={styles.label}>EMAIL AKUN</Text>
            <View style={[styles.inputWrapper, { backgroundColor: 'rgba(17, 24, 39, 0.8)' }]}>
              <FontAwesome5 name="envelope" size={16} color="#6b7280" style={styles.inputIcon} />
              <TextInput 
                style={[styles.input, { color: '#9ca3af' }]} 
                value={emailFromUrl || 'Email tidak terdeteksi'} 
                editable={false} 
              />
            </View>

            {/* Input Password Baru */}
            <Text style={styles.label}>PASSWORD BARU</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="lock" size={16} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Input Konfirmasi Password */}
            <Text style={styles.label}>ULANGI PASSWORD BARU</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="check-circle" size={16} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Konfirmasi password"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                <FontAwesome5 name={showConfirmPassword ? "eye" : "eye-slash"} size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Tombol Submit */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleResetPassword} 
              style={[styles.buttonShadow, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
            >
              <LinearGradient colors={isLoading ? ['#4ade80', '#86efac'] : ['#16a34a', '#22c55e']} style={styles.button}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <FontAwesome5 name="save" size={16} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Simpan Password Baru</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  blob: { position: 'absolute', width: 250, height: 250, borderRadius: 125, opacity: 0.15 },
  blobRed: { backgroundColor: '#dc2626' },
  blobOrange: { backgroundColor: '#ea580c' },
  blobDarkRed: { backgroundColor: '#991b1b' },
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  iconBox: {
    width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  title: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  subtitle: { color: '#9ca3af', fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
  formContainer: { width: '100%' },
  label: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderWidth: 1, borderColor: '#374151', borderRadius: 12, marginBottom: 20, paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: 'white', fontSize: 14, paddingVertical: 14, fontWeight: '500' },
  eyeButton: { padding: 10 },
  buttonShadow: { marginTop: 10, shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { opacity: 0.7, shadowOpacity: 0 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  buttonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
});