import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyGarageMobile() {
  const [garageData, setGarageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Pelanggan');
  
  // State Filter
  const [filterPlate, setFilterPlate] = useState('all');
  
  const bulanIndoPendek = {
    1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'Mei', 6: 'Jun',
    7: 'Jul', 8: 'Agu', 9: 'Sep', 10: 'Okt', 11: 'Nov', 12: 'Des'
  };
  
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= 2024; i--) years.push(i);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const router = useRouter();

  const fetchGarageData = async (month, year) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const name = await AsyncStorage.getItem('user_name');
      if (name) setUserName(name);

      const response = await axios.get('http://10.76.124.100:8000/api/my-garage', {
        headers: { Authorization: `Bearer ${token}` },
        params: { month: month, year: year } 
      });
      
      setGarageData(response.data.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        router.replace('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGarageData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGarageData(selectedMonth, selectedYear); 
    setRefreshing(false);
  }, [selectedMonth, selectedYear]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/'); 
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID').format(angka || 0);
  };

  if (isLoading && !garageData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Menyiapkan garasi Anda...</Text>
      </View>
    );
  }

  const activeServices = garageData?.active || [];
  const historyServices = garageData?.history || [];
  const uniquePlates = [...new Set(historyServices.map(item => item.vehicle.plat))];
  
  const filteredHistory = filterPlate === 'all' 
    ? historyServices 
    : historyServices.filter(item => item.vehicle.plat === filterPlate);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Efek Background Semu */}
      <View style={styles.bgGlowRed} />
      <View style={styles.bgGlowOrange} />

      {/* --- NAVBAR WHITE GLASS --- */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.logoContainer} onPress={onRefresh} activeOpacity={0.7}>
          <View style={styles.logoIconBox}>
            <FontAwesome5 name="motorcycle" size={12} color="white" />
          </View>
          <Text style={styles.logoText} numberOfLines={1}>
            MJ MOTO<Text style={styles.logoRed}>PERFORMANCE</Text>
          </Text>
        </TouchableOpacity>
        
        <View style={styles.navRight}>
          <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <FontAwesome5 name="sign-out-alt" size={14} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#dc2626']} />
        }
      >
        
        {/* Header Teks */}
        <View style={styles.pageHeaderBox}>
          <Text style={styles.pageTitle}>Dashboard Kendaraan</Text>
          <Text style={styles.pageSubtitle}>Pantau status pengerjaan dan riwayat Anda secara real-time.</Text>
        </View>

        {/* --- BAGIAN: SEDANG DIKERJAKAN --- */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBox}>
            <FontAwesome5 name="satellite-dish" size={14} color="#dc2626" />
          </View>
          <Text style={styles.sectionTitle}>Sedang Dikerjakan</Text>
        </View>

        {activeServices.length === 0 ? (
          <View style={styles.glassCardEmpty}>
            <View style={styles.emptyIconCircle}>
              <FontAwesome5 name="motorcycle" size={32} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>Tidak ada kendaraan di bengkel</Text>
            <Text style={styles.emptyText}>Kendaraan yang sedang antre atau diservis akan otomatis muncul di sini.</Text>
          </View>
        ) : (
          activeServices.map((service, index) => (
            <View key={index} style={styles.glassCard}>
              <View style={styles.gradientTopLine} />
              
              <View style={styles.cardHeader}>
                <View style={{flex: 1, paddingRight: 10}}>
                  <View style={styles.platBadge}>
                    <Text style={styles.platText}>{service.vehicle.plat}</Text>
                  </View>
                  <Text style={styles.vehicleName}>{service.vehicle.merek}</Text>
                  <Text style={styles.complaintText}>Keluhan: <Text style={{fontWeight: '700', color: '#334155'}}>{service.complaint}</Text></Text>
                </View>
                <View style={styles.costContainer}>
                  <Text style={styles.costLabel}>Estimasi Sementara</Text>
                  <Text style={styles.costValue}>Rp {formatRupiah(service.total_cost)}</Text>
                </View>
              </View>

              <View style={styles.trackerContainer}>
                {/* Garis Track Belakang */}
                <View style={styles.trackLineBg} />
                {/* Garis Track Aktif */}
                <View style={[styles.trackLineRed, { width: service.status === 'pending' ? '0%' : '50%' }]} />

                {/* Wadah pembungkus row agar bulatan menyamping */}
                <View style={styles.trackStepsRow}>
                  {/* Step 1: Antrean */}
                  <View style={styles.trackStepWrapper}>
                    <View style={[styles.trackIcon, ['pending', 'processing'].includes(service.status) ? styles.trackIconActive : styles.trackIconInactive]}>
                      <FontAwesome5 name="clipboard-list" size={16} color={['pending', 'processing'].includes(service.status) ? "white" : "#94a3b8"} />
                    </View>
                    <Text style={[styles.trackText, service.status === 'pending' ? styles.trackTextActive : styles.trackTextMuted]}>Antrean</Text>
                  </View>

                  {/* Step 2: Dikerjakan */}
                  <View style={styles.trackStepWrapper}>
                    <View style={[styles.trackIcon, service.status === 'processing' ? styles.trackIconActive : styles.trackIconInactive]}>
                      <FontAwesome5 name="tools" size={16} color={service.status === 'processing' ? 'white' : '#94a3b8'} />
                    </View>
                    <Text style={[styles.trackText, service.status === 'processing' ? styles.trackTextActive : styles.trackTextMuted]}>Dikerjakan</Text>
                  </View>

                  {/* Step 3: Selesai */}
                  <View style={styles.trackStepWrapper}>
                    <View style={[styles.trackIcon, styles.trackIconInactive]}>
                      <FontAwesome5 name="check-double" size={16} color="#94a3b8" />
                    </View>
                    <Text style={[styles.trackText, styles.trackTextMuted]}>Selesai</Text>
                  </View>
                </View>
              </View>

            </View>
          ))
        )}

        {/* --- BAGIAN: RIWAYAT TRANSAKSI --- */}
        <View style={[styles.sectionHeader, {marginTop: 24}]}>
          <View style={styles.sectionIconBoxGray}>
            <FontAwesome5 name="history" size={14} color="#64748b" />
          </View>
          <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
        </View>

        {/* FILTER WAKTU (Glass Pill) */}
        <View style={styles.glassFilterBox}>
          <Text style={styles.filterLabel}>Filter Waktu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {years.map(year => (
              <TouchableOpacity key={year} style={[styles.pill, selectedYear === year && styles.pillActive]} onPress={() => setSelectedYear(year)}>
                <Text style={[styles.pillText, selectedYear === year && styles.pillTextActive]}>{year}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {Object.entries(bulanIndoPendek).map(([angka, nama]) => (
              <TouchableOpacity key={angka} style={[styles.pill, selectedMonth === parseInt(angka) && styles.pillActive]} onPress={() => setSelectedMonth(parseInt(angka))}>
                <Text style={[styles.pillText, selectedMonth === parseInt(angka) && styles.pillTextActive]}>{nama}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FILTER PLAT KENDARAAN */}
        {historyServices.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.filterLabelOut}>Pilih Kendaraan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              <TouchableOpacity style={[styles.pill, filterPlate === 'all' && styles.pillActive]} onPress={() => setFilterPlate('all')}>
                <Text style={[styles.pillText, filterPlate === 'all' && styles.pillTextActive]}>Semua Plat</Text>
              </TouchableOpacity>
              {uniquePlates.map((plat, idx) => (
                <TouchableOpacity key={idx} style={[styles.pill, filterPlate === plat && styles.pillActive]} onPress={() => setFilterPlate(plat)}>
                  <Text style={[styles.pillText, filterPlate === plat && styles.pillTextActive]}>{plat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* KARTU RIWAYAT NOTA */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#dc2626" style={{ marginTop: 20 }} />
        ) : historyServices.length === 0 ? (
          <View style={styles.glassCardEmpty}>
            <Text style={styles.emptyText}>Tidak ada transaksi pada bulan ini.</Text>
          </View>
        ) : filteredHistory.length === 0 ? (
          <View style={styles.glassCardEmpty}>
            <Text style={styles.emptyText}>Tidak ada riwayat untuk kendaraan ini.</Text>
          </View>
        ) : (
          filteredHistory.map((hist, index) => (
            <View key={index} style={styles.glassHistoryCard}>
              
              <View style={styles.histHeader}>
                <View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>SELESAI</Text>
                  </View>
                  <Text style={styles.histPlat}>{hist.vehicle.plat}</Text>
                  <Text style={styles.histMerek}>{hist.vehicle.merek}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.histTanggal}>{hist.tanggal}</Text>
                  </View>
                  <Text style={styles.histMekanikLabel}>Mekanik:</Text>
                  <Text style={styles.histMekanik}>{hist.mekanik}</Text>
                </View>
              </View>

              <View style={styles.histBody}>
                <View style={styles.rincianHeader}>
                  <FontAwesome5 name="receipt" size={10} color="#94a3b8" />
                  <Text style={styles.rincianLabel}>RINCIAN NOTA</Text>
                </View>
                
                <View style={styles.rincianItemBox}>
                  <View style={styles.rincianRow}>
                    <Text style={styles.rincianItemMaster}>Jasa Servis</Text>
                    <Text style={styles.rincianHargaMaster}>Rp {formatRupiah(hist.jasa_servis)}</Text>
                  </View>
                  {hist.rincian_suku_cadang && hist.rincian_suku_cadang.map((detail, idx) => (
                    <View key={idx} style={styles.rincianRowPart}>
                      <Text style={styles.rincianItem} numberOfLines={1}>- {detail.nama} (x{detail.qty})</Text>
                      <Text style={styles.rincianHarga}>Rp {formatRupiah(detail.subtotal)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.histFooter}>
                <Text style={styles.totalLabel}>TOTAL BAYAR</Text>
                <Text style={styles.totalValue}>Rp {formatRupiah(hist.biaya)}</Text>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLING (White Glassmorphism) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, color: '#64748b', fontWeight: 'bold' },
  
  bgGlowRed: { position: 'absolute', top: -100, left: -50, width: 300, height: 300, backgroundColor: '#fca5a5', borderRadius: 150, opacity: 0.15 },
  bgGlowOrange: { position: 'absolute', top: 50, right: -100, width: 300, height: 300, backgroundColor: '#fed7aa', borderRadius: 150, opacity: 0.15 },

  navbar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingVertical: 12, // Dibuat sedikit lebih ramping
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 1)',
    zIndex: 10
  },
  logoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flexShrink: 1, 
    marginRight: 10 
  },
  logoIconBox: { 
    backgroundColor: '#0f172a', 
    width: 24, // Dikecilkan sedikit
    height: 24, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 8, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset:{width:0, height:2}, 
    shadowOpacity: 0.1, 
    shadowRadius: 2 
  },
  // PERBAIKAN: Font size dikecilkan jadi 13, letter spacing dipersempit, dan bisa shrink
  logoText: { 
    color: '#0f172a', 
    fontSize: 13, 
    fontWeight: '900', 
    letterSpacing: 0.2,
    flexShrink: 1
  },
  logoRed: { color: '#dc2626' },
  
  navRight: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flexShrink: 1 
  }, 
  userName: { 
    color: '#475569', 
    fontSize: 13, 
    fontWeight: '700', 
    marginRight: 10, 
    flexShrink: 1, 
    maxWidth: 90 // Memastikan nama tidak mendesak tombol keluar terlalu jauh
  },
  logoutButton: { 
    backgroundColor: 'white', 
    padding: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    shadowColor: '#000', 
    shadowOffset: {width:0, height:1}, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 1 
  },
  
  scrollContent: { padding: 16, paddingBottom: 100 },
  
  pageHeaderBox: { marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  pageSubtitle: { color: '#64748b', marginTop: 4, fontSize: 14, lineHeight: 20 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIconBox: { backgroundColor: '#fee2e2', width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionIconBoxGray: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10, shadowColor: '#000', shadowOffset:{width:0, height:1}, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  
  glassCardEmpty: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'white', marginBottom: 20, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  emptyIconCircle: { backgroundColor: '#f1f5f9', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontWeight: 'bold', color: '#334155', fontSize: 16, marginBottom: 4 },
  emptyText: { color: '#64748b', fontSize: 13, textAlign: 'center', lineHeight: 18 },

  glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: {width:0, height:8}, shadowOpacity: 0.05, shadowRadius: 15, elevation: 4, overflow: 'hidden' },
  gradientTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#dc2626' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16, marginBottom: 20, marginTop: 4 },
  platBadge: { backgroundColor: '#0f172a', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  platText: { color: 'white', fontWeight: 'bold', fontSize: 12, letterSpacing: 1.5 },
  vehicleName: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  complaintText: { color: '#64748b', marginTop: 4, fontSize: 13 },
  costContainer: { backgroundColor: 'white', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'flex-end', justifyContent: 'center' },
  costLabel: { color: '#94a3b8', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  costValue: { color: '#dc2626', fontSize: 22, fontWeight: '900' },

  trackerContainer: { position: 'relative', paddingHorizontal: 10, paddingBottom: 10, marginTop: 15 },
  trackStepsRow: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  
  trackLineBg: { position: 'absolute', top: 22, left: 30, right: 30, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, zIndex: 0 },
  trackLineRed: { position: 'absolute', top: 22, left: 30, height: 4, backgroundColor: '#dc2626', borderRadius: 2, zIndex: 1 },
  
  trackStepWrapper: { alignItems: 'center' },
  trackIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 4, borderColor: 'white' },
  trackIconActive: { backgroundColor: '#dc2626', shadowColor: '#dc2626', shadowOffset:{width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  trackIconInactive: { backgroundColor: '#f1f5f9' },
  
  trackText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  trackTextActive: { color: '#dc2626' },
  trackTextMuted: { color: '#94a3b8' },

  glassFilterBox: { backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: 12, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: 'white' },
  filterLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 },
  filterLabelOut: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillRow: { flexDirection: 'row', marginBottom: 8 },
  pill: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset:{width:0, height:1}, shadowOpacity: 0.02, shadowRadius: 1, elevation: 1 },
  pillActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  pillText: { color: '#64748b', fontWeight: 'bold', fontSize: 12 },
  pillTextActive: { color: 'white' },

  glassHistoryCard: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'white', shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  histHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16, marginBottom: 16 },
  statusBadge: { backgroundColor: '#dcfce7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  statusText: { color: '#166534', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  histPlat: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  histMerek: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  dateBadge: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  histTanggal: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
  histMekanikLabel: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  histMekanik: { fontSize: 13, color: '#334155', fontWeight: 'bold' },
  
  histBody: { marginBottom: 16 },
  rincianHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rincianLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1, marginLeft: 6 },
  rincianItemBox: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  rincianRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rincianRowPart: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingLeft: 4 },
  rincianItemMaster: { fontSize: 13, color: '#475569', fontWeight: '600' },
  rincianHargaMaster: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  rincianItem: { fontSize: 12, color: '#64748b', flex: 1, paddingRight: 10 },
  rincianHarga: { fontSize: 12, fontWeight: '600', color: '#475569' },
  
  histFooter: { backgroundColor: '#0f172a', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1 },
  totalValue: { fontSize: 20, fontWeight: '900', color: 'white' }
});