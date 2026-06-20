import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <View style={styles.content}>
        
        {/* --- BAGIAN LOGO & JUDUL --- */}
        <View style={styles.header}>
          {/* Kotak Logo Miring (Konsisten dengan Login) */}
          <View style={styles.logoBox}>
            <FontAwesome5 name="motorcycle" size={38} color="#ffffff" />
          </View>

          <View style={styles.titleWrapper}>
            <Text style={styles.titleTop}>MJ MOTO</Text>
          </View>
          <Text style={styles.titleBottom}>PERFORMANCE</Text>
          
          <Text style={styles.subtitle}>Portal Pelanggan Bengkel Resmi</Text>
        </View>

        {/* --- BAGIAN KARTU TOMBOL (Glassmorphism) --- */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardText}>Selamat datang! Silakan masuk untuk melacak servis kendaraan Anda.</Text>
          
          <TouchableOpacity 
            style={styles.btnLogin} 
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="sign-in-alt" size={16} color="white" style={styles.btnIcon} />
            <Text style={styles.btnLoginText}>Masuk Garasi</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnRegister} 
            onPress={() => router.push('/register')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="user-plus" size={14} color="#f87171" style={styles.btnIcon} />
            <Text style={styles.btnRegisterText}>Buat Akun Baru</Text>
          </TouchableOpacity>
        </View>

        {/* --- BAGIAN FOOTER --- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 MJ MotoPerformance</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

// --- DESAIN UI (STYLES) MODERN ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a'
  }, 
  content: { 
    flex: 1, 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 60,
    paddingHorizontal: 24
  },
  
  // Gaya Header & Logo
  header: { 
    alignItems: 'center', 
    marginTop: 40 
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#dc2626', // bg-red-600
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ rotate: '-3deg' }] // Efek miring yang sama dengan Login
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTop: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: '#ef4444', // text-red-500
    letterSpacing: 2, 
    textAlign: 'center' 
  },
  titleBottom: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#ffffff', 
    letterSpacing: 4, 
    textAlign: 'center',
    marginTop: -4 
  },
  subtitle: { 
    color: '#94a3b8', // text-slate-400
    marginTop: 16, 
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5
  },

  // Gaya Glassmorphism Card
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.7)', // bg-slate-800/70
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)', // border-slate-700/50
    marginBottom: 20,
    alignItems: 'center'
  },
  cardText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  
  // Gaya Tombol
  btnIcon: {
    marginRight: 10
  },
  btnLogin: { 
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#dc2626', // Solid Red
    paddingVertical: 16, 
    borderRadius: 14, 
    justifyContent: 'center',
    alignItems: 'center', 
    marginBottom: 16,
    shadowColor: '#ef4444', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5
  },
  btnLoginText: { 
    color: '#ffffff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  btnRegister: { 
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // Gelap transparan
    borderWidth: 1, 
    borderColor: '#334155', // Outline tipis
    paddingVertical: 16, 
    borderRadius: 14, 
    justifyContent: 'center',
    alignItems: 'center' 
  },
  btnRegisterText: { 
    color: '#f87171', // text-red-400
    fontWeight: 'bold', 
    fontSize: 15 
  },

  // Gaya Footer
  footer: {
    opacity: 0.5
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500'
  }
});