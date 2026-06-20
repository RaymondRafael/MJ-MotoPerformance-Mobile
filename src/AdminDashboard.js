import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AdminSidebar from './components/AdminSidebar';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const router = useRouter();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); 

  // Data Waktu untuk Filter
  const bulanIndoPendek = {
    1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'Mei', 6: 'Jun',
    7: 'Jul', 8: 'Agu', 9: 'Sep', 10: 'Okt', 11: 'Nov', 12: 'Des'
  }; 
  
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= 2024; i--) years.push(i);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [stats, setStats] = useState({
    pendapatan: 0,
    antreanAktif: 0,
    selesaiPeriode: 0,
    pelangganBaru: 0,
    antreanTerbaru: []
  });

  const fetchDashboardData = async (month, year) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const name = await AsyncStorage.getItem('user_name');
      if (name) setUserName(name);

      const response = await axios.get('https://swiftness-shifter-promotion.ngrok-free.dev/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
        params: { month: month, year: year } 
      });
      
      setStats(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data admin:", error);
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        router.replace('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil API setiap kali bulan atau tahun diubah
  useEffect(() => {
    fetchDashboardData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID').format(angka || 0);

  return (
    <View style={styles.container}>
      
      {/* --- KOMPONEN SIDEBAR --- */}
      <AdminSidebar visible={isSidebarVisible} onClose={() => setIsSidebarVisible(false)} />

      {/* --- NAVBAR MODERN (Tombol Hamburger) --- */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={() => setIsSidebarVisible(true)} style={styles.hamburgerButton}>
            <FontAwesome5 name="bars" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.logoText}>
            MJ MOTO<Text style={styles.logoRed}>PERFORMANCE</Text>
          </Text>
        </View>
      </View>

      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerTitle}>
          <Text style={styles.pageTitle}>Dashboard Admin</Text>
          <Text style={styles.pageSubtitle}>Ringkasan performa bengkel saat ini.</Text>
        </View>

        {/* --- FILTER KAPSUL --- */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}><FontAwesome5 name="filter" /> Filter Bulan & Tahun</Text>
          
          {/* Filter Tahun */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {years.map(year => (
              <TouchableOpacity 
                key={year} 
                style={[styles.pill, selectedYear === year && styles.pillActive]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[styles.pillText, selectedYear === year && styles.pillTextActive]}>{year}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Filter Bulan */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {Object.entries(bulanIndoPendek).map(([angka, nama]) => (
              <TouchableOpacity 
                key={angka} 
                style={[styles.pill, selectedMonth === parseInt(angka) && styles.pillActive]}
                onPress={() => setSelectedMonth(parseInt(angka))}
              >
                <Text style={[styles.pillText, selectedMonth === parseInt(angka) && styles.pillTextActive]}>{nama}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#ef4444" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* --- 4 KARTU STATISTIK (Grid 2x2) --- */}
            <View style={styles.statsGrid}>
              
              {/* Kartu Pendapatan */}
              <View style={[styles.statCard, { borderTopColor: '#22c55e', borderTopWidth: 4 }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                  <FontAwesome5 name="wallet" size={16} color="#16a34a" />
                </View>
                <Text style={styles.statLabel}>PENDAPATAN</Text>
                <Text style={styles.statValueRp} numberOfLines={1} adjustsFontSizeToFit>
                  Rp {formatRupiah(stats.pendapatan)}
                </Text>
              </View>

              {/* Kartu Antrean */}
              <View style={[styles.statCard, { borderTopColor: '#ef4444', borderTopWidth: 4 }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
                  <FontAwesome5 name="motorcycle" size={16} color="#dc2626" />
                </View>
                <Text style={styles.statLabel}>ANTREAN AKTIF</Text>
                <Text style={styles.statValueNumber}>{stats.antreanAktif} <Text style={styles.statUnit}>Motor</Text></Text>
              </View>

              {/* Kartu Selesai */}
              <View style={[styles.statCard, { borderTopColor: '#3b82f6', borderTopWidth: 4 }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
                  <FontAwesome5 name="check-double" size={16} color="#2563eb" />
                </View>
                <Text style={styles.statLabel}>SELESAI</Text>
                <Text style={styles.statValueNumber}>{stats.selesaiPeriode} <Text style={styles.statUnit}>Motor</Text></Text>
              </View>

              {/* Kartu Pendaftar */}
              <View style={[styles.statCard, { borderTopColor: '#a855f7', borderTopWidth: 4 }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#f3e8ff' }]}>
                  <FontAwesome5 name="users" size={16} color="#9333ea" />
                </View>
                <Text style={styles.statLabel}>PENDAFTAR</Text>
                <Text style={styles.statValueNumber}>{stats.pelangganBaru} <Text style={styles.statUnit}>Orang</Text></Text>
              </View>

            </View>

            {/* --- DAFTAR ANTREAN TERATAS (Pengganti Tabel) --- */}
            <View style={styles.queueSection}>
              <View style={styles.queueHeader}>
                <Text style={styles.queueTitle}>5 Antrean Teratas</Text>
                <TouchableOpacity onPress={() => router.push('/transactions')}>
                  <Text style={styles.queueLink}>Lihat Semua <FontAwesome5 name="arrow-right" size={10} /></Text>
                </TouchableOpacity>
              </View>

              <View style={styles.queueList}>
                {stats.antreanTerbaru.length > 0 ? (
                  stats.antreanTerbaru.map((antrean, idx) => (
                    <View key={antrean.id} style={[styles.queueItem, idx === stats.antreanTerbaru.length - 1 && { borderBottomWidth: 0 }]}>
                      <View style={styles.queueLeft}>
                        <Text style={styles.queuePlat}>{antrean.plat}</Text>
                        <Text style={styles.queuePelanggan} numberOfLines={1}>{antrean.pelanggan}</Text>
                        <Text style={styles.queueWaktu}>{antrean.waktu}</Text>
                      </View>
                      <View style={styles.queueRight}>
                        {antrean.status === 'pending' && (
                          <View style={[styles.badge, { backgroundColor: '#fef08a' }]}>
                            <FontAwesome5 name="clock" size={10} color="#854d0e" />
                            <Text style={[styles.badgeText, { color: '#854d0e' }]}> Antrean</Text>
                          </View>
                        )}
                        {antrean.status === 'processing' && (
                          <View style={[styles.badge, { backgroundColor: '#bfdbfe' }]}>
                            <FontAwesome5 name="tools" size={10} color="#1e40af" />
                            <Text style={[styles.badgeText, { color: '#1e40af' }]}> Dikerjakan</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#9ca3af', fontWeight: 'bold' }}>Tidak ada kendaraan di antrean.</Text>
                  </View>
                )}
              </View>
            </View>
            
          </>
        )}
      </ScrollView>
    </View>
  );
}

// --- STYLING CSS NATIVE ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  
  // Navbar Baru dengan Hamburger
  // Tambahkan paddingTop: 40 untuk mendorongnya turun dari area status bar HP
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 40, backgroundColor: '#111827' },
  navLeft: { flexDirection: 'row', alignItems: 'center' },
  hamburgerButton: { padding: 8, marginRight: 10, marginLeft: -8 },
  logoText: { color: 'white', fontSize: 16, fontWeight: '900' },
  logoRed: { color: '#ef4444' },
  
  mainContent: { padding: 16, paddingBottom: 40 },
  headerTitle: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  pageSubtitle: { color: '#6b7280', fontSize: 13, marginTop: 2 },

  // Filter Kapsul
  filterSection: { backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  filterLabel: { fontSize: 12, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 12 },
  pillRow: { flexDirection: 'row', marginBottom: 10 },
  pill: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  pillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  pillText: { color: '#6b7280', fontWeight: 'bold', fontSize: 12 },
  pillTextActive: { color: 'white' },

  // 4 Kartu Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 },
  statValueRp: { fontSize: 16, fontWeight: '900', color: '#111827' },
  statValueNumber: { fontSize: 22, fontWeight: '900', color: '#111827' },
  statUnit: { fontSize: 12, fontWeight: 'bold', color: '#6b7280' },

  // Daftar Antrean
  queueSection: { backgroundColor: 'white', borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, overflow: 'hidden', marginBottom: 30 },
  queueHeader: { backgroundColor: '#f9fafb', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  queueTitle: { fontWeight: 'bold', color: '#374151' },
  queueLink: { fontSize: 12, fontWeight: 'bold', color: '#dc2626' },
  queueList: { paddingHorizontal: 16 },
  queueItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  queueLeft: { flex: 1, paddingRight: 10 },
  queuePlat: { fontSize: 16, fontWeight: '900', color: '#111827', letterSpacing: 0.5 },
  queuePelanggan: { fontSize: 13, fontWeight: 'bold', color: '#4b5563', marginTop: 2 },
  queueWaktu: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  queueRight: { alignItems: 'flex-end' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }
});