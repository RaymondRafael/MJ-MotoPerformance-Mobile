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
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert('Peringatan', 'Silakan masukkan email Anda terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('https://swiftness-shifter-promotion.ngrok-free.dev/api/forgot-password', {
        email: email
      });

      if (response.data.success) {
        Alert.alert(
          'Email Terkirim!',
          'Silakan periksa kotak masuk (atau folder spam) email Anda untuk instruksi pengaturan ulang kata sandi.',
          [
            { text: 'Oke', onPress: () => router.replace('/login') }
          ]
        );
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mengirim link. Silakan coba lagi.';
      Alert.alert('Gagal Mengirim', errorMessage);
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
            <LinearGradient colors={['#dc2626', '#ef4444']} style={styles.iconBox}>
              <FontAwesome5 name="key" size={28} color="white" />
            </LinearGradient>
            <Text style={styles.title}>LUPA PASSWORD?</Text>
            <Text style={styles.subtitle}>
              Jangan panik. Masukkan email yang terdaftar, dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi Anda.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>EMAIL AKUN ANDA</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="envelope" size={16} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="contoh@email.com"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Tombol Submit */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleSendResetLink} 
              style={[styles.buttonShadow, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
            >
              <LinearGradient colors={isLoading ? ['#f87171', '#fca5a5'] : ['#dc2626', '#ef4444']} style={styles.button}>
                {isLoading ? (
                   <ActivityIndicator color="white" />
                ) : (
                  <>
                    <FontAwesome5 name="paper-plane" size={16} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Kirim Link Reset</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah ingat password Anda?</Text>
            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}>
              <FontAwesome5 name="sign-in-alt" size={12} color="#f87171" style={{ marginRight: 6 }} />
              <Text style={styles.linkText}>Kembali untuk Masuk</Text>
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
    shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  title: { color: 'white', fontSize: 22, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  subtitle: { color: '#9ca3af', fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
  formContainer: { width: '100%' },
  label: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderWidth: 1, borderColor: '#374151', borderRadius: 12, marginBottom: 24, paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: 'white', fontSize: 14, paddingVertical: 14, fontWeight: '500' },
  buttonShadow: { shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { opacity: 0.7, shadowOpacity: 0 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  buttonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  footer: { marginTop: 30, paddingTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(55, 65, 81, 0.5)', alignItems: 'center' },
  footerText: { color: '#9ca3af', fontSize: 13, marginBottom: 8 },
  linkButton: { flexDirection: 'row', alignItems: 'center' },
  linkText: { color: '#f87171', fontSize: 13, fontWeight: 'bold' },
});