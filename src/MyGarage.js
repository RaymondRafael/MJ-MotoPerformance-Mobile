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

      const response = await axios.get('https://swiftness-shifter-promotion.ngrok-free.dev/api/my-garage', {
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

      {/* --- NAVBAR --- */}
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
        
        <View style={styles.pageHeaderBox}>
          <Text style={styles.pageTitle}>Dashboard Kendaraan</Text>
          <Text style={styles.pageSubtitle}>Pantau status pengerjaan dan riwayat Anda secara real-time.</Text>
        </View>

        {/* --- BAGIAN: PELACAKAN AKTIF --- */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBox}>
            <FontAwesome5 name="satellite-dish" size={14} color="#dc2626" />
          </View>
          <Text style={styles.sectionTitle}>Pelacakan Aktif</Text>
        </View>

        {activeServices.length === 0 ? (
          <View style={styles.glassCardEmpty}>
            <View style={styles.emptyIconCircle}>
              <FontAwesome5 name="motorcycle" size={32} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>Tidak ada kendaraan di bengkel</Text>
            <Text style={styles.emptyText}>Kendaraan yang sedang antre, diservis, atau menunggu diambil akan muncul di sini.</Text>
          </View>
        ) : (
          activeServices.map((service, index) => {
            const isFinished = service.status === 'finished';
            const isProcessing = service.status === 'processing';
            
            // Ambil nama mekanik (bisa aktif maupun historis jika dihapus admin)
            const mekanikName = service.mekanik || service.historical_mechanic_name;
            
            return (
              <View key={index} style={styles.glassCard}>
                <View style={[styles.gradientTopLine, isFinished && { backgroundColor: '#10b981' }]} />
                
                <View style={styles.cardHeader}>
                  <View style={{flex: 1, paddingRight: 10}}>
                    <View style={styles.platBadge}>
                      <Text style={styles.platText}>{service.vehicle.plat}</Text>
                    </View>
                    <Text style={styles.vehicleName}>{service.vehicle.merek}</Text>
                    <Text style={styles.complaintText}>Keluhan: <Text style={{fontWeight: '700', color: '#334155'}}>{service.complaint}</Text></Text>
                  </View>
                  <View style={styles.costContainer}>
                    <Text style={styles.costLabel}>Total Tagihan Servis</Text>
                    <Text style={[styles.costValue, isFinished && { color: '#10b981' }]}>Rp {formatRupiah(service.total_cost)}</Text>
                  </View>
                </View>

                {/* INFO MEKANIK AKTIF (DIPASTIKAN MUNCUL) */}
                <View style={styles.mechanicContainer}>
                  <Text style={styles.mechanicLabel}>
                    <FontAwesome5 name="wrench" size={10} color="#94a3b8" />  Mekanik Bertugas
                  </Text>
                  
                  {mekanikName ? (
                    <View style={styles.mechanicBadge}>
                      <View style={styles.mechanicPulseDot} />
                      <FontAwesome5 name="user-cog" size={12} color="#2563eb" style={{marginRight: 6}} />
                      <Text style={styles.mechanicText}>{mekanikName}</Text>
                    </View>
                  ) : (
                    <View style={styles.mechanicBadgePending}>
                      <FontAwesome5 name="hourglass-start" size={10} color="#94a3b8" style={{marginRight: 6}} />
                      <Text style={styles.mechanicTextPending}>Menunggu Mekanik</Text>
                    </View>
                  )}
                </View>

                {/* TRACKER PROGRESS BAR (SISTEM FLEXBOX BARU - ANTI PUTUS) */}
                <View style={styles.trackerWrapper}>
                  <View style={styles.trackerRow}>
                    
                    {/* Step 1: Antrean */}
                    <View style={[styles.trackCircle, styles.trackCircleActive]}>
                      <FontAwesome5 name="clipboard-list" size={14} color="white" />
                    </View>

                    {/* Line 1 (Antrean -> Dikerjakan) */}
                    <View style={[styles.trackLine, (isProcessing || isFinished) ? styles.trackLineActive : styles.trackLineInactive]} />

                    {/* Step 2: Dikerjakan */}
                    <View style={[styles.trackCircle, (isProcessing || isFinished) ? styles.trackCircleActive : styles.trackCircleInactive]}>
                      <FontAwesome5 name="tools" size={14} color={(isProcessing || isFinished) ? "white" : "#94a3b8"} />
                    </View>

                    {/* Line 2 (Dikerjakan -> Selesai) */}
                    <View style={[styles.trackLine, isFinished ? styles.trackLineFinished : styles.trackLineInactive]} />

                    {/* Step 3: Selesai */}
                    <View style={[styles.trackCircle, isFinished ? styles.trackCircleFinished : styles.trackCircleInactive]}>
                      <FontAwesome5 name="check-double" size={14} color={isFinished ? "white" : "#94a3b8"} />
                    </View>
                  </View>

                  <View style={styles.trackerLabels}>
                    <Text style={[styles.trackLabel, styles.trackLabelActive]}>ANTREAN</Text>
                    <Text style={[styles.trackLabel, (isProcessing || isFinished) ? styles.trackLabelActive : styles.trackLabelInactive]}>DIKERJAKAN</Text>
                    <Text style={[styles.trackLabel, isFinished ? styles.trackLabelFinished : styles.trackLabelInactive]}>SELESAI</Text>
                  </View>
                </View>

                {/* NOTIFIKASI SIAP DIAMBIL JIKA FINISHED */}
                {isFinished && (
                  <View style={styles.readyNotification}>
                    <View style={styles.readyIconBox}>
                      <FontAwesome5 name="bell" size={18} color="white" solid />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.readyTitle}>Motor Siap Diambil!</Text>
                      <Text style={styles.readyText}>Kendaraan Anda telah selesai diperbaiki. Silakan ke kasir untuk pelunasan dan pengambilan kunci.</Text>
                    </View>
                  </View>
                )}

              </View>
            );
          })
        )}

        {/* --- BAGIAN: RIWAYAT TRANSAKSI (HANYA LUNAS) --- */}
        <View style={[styles.sectionHeader, {marginTop: 24}]}>
          <View style={styles.sectionIconBoxGray}>
            <FontAwesome5 name="history" size={14} color="#64748b" />
          </View>
          <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
        </View>

        {/* FILTER WAKTU */}
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
            <Text style={styles.emptyText}>Belum ada riwayat servis yang telah dilunasi.</Text>
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
                  <View style={[styles.statusBadge, {backgroundColor: '#f3e8ff'}]}>
                    <Text style={[styles.statusText, {color: '#7e22ce'}]}><FontAwesome5 name="check-double" size={8}/> LUNAS</Text>
                  </View>
                  <Text style={styles.histPlat}>{hist.vehicle.plat}</Text>
                  <Text style={styles.histMerek}>{hist.vehicle.merek}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.histTanggal}>{hist.tanggal}</Text>
                  </View>
                  <Text style={styles.histMekanikLabel}>Mekanik:</Text>
                  
                  {hist.mekanik ? (
                     <Text style={styles.histMekanik}>{hist.mekanik}</Text>
                  ) : (
                     <Text style={[styles.histMekanik, {textDecorationLine: 'line-through', color: '#94a3b8'}]}>
                       {hist.historical_mechanic_name || '-'}
                     </Text>
                  )}
                </View>
              </View>

              <View style={styles.histComplaintBox}>
                <FontAwesome5 name="comment-alt" size={24} color="rgba(254, 202, 202, 0.3)" style={{position: 'absolute', right: 12, top: 12}} />
                <Text style={styles.histComplaintLabel}>Keluhan / Gejala</Text>
                <Text style={styles.histComplaintText}>"{hist.keluhan}"</Text>
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
                      {detail.nama && detail.nama !== 'Suku Cadang Lama' ? (
                         <Text style={styles.rincianItem} numberOfLines={1}>- {detail.nama} (x{detail.qty})</Text>
                      ) : (
                         <Text style={[styles.rincianItem, {textDecorationLine: 'line-through', color: '#94a3b8'}]} numberOfLines={1}>
                           - {detail.historical_name || 'Barang Dihapus'} (x{detail.qty})
                         </Text>
                      )}
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

// Desain UI
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
    paddingVertical: 12, 
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 1)',
    zIndex: 10
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 10 },
  logoIconBox: { backgroundColor: '#0f172a', width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8, elevation: 2 },
  logoText: { color: '#0f172a', fontSize: 13, fontWeight: '900', letterSpacing: 0.2, flexShrink: 1 },
  logoRed: { color: '#dc2626' },
  
  navRight: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 }, 
  userName: { color: '#475569', fontSize: 13, fontWeight: '700', marginRight: 10, flexShrink: 1, maxWidth: 90 },
  logoutButton: { backgroundColor: 'white', padding: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  
  scrollContent: { padding: 16, paddingBottom: 100 },
  
  pageHeaderBox: { marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  pageSubtitle: { color: '#64748b', marginTop: 4, fontSize: 14, lineHeight: 20 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIconBox: { backgroundColor: '#fee2e2', width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionIconBoxGray: { backgroundColor: 'rgba(226, 232, 240, 0.6)', width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  
  glassCardEmpty: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'white', marginBottom: 20, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  emptyIconCircle: { backgroundColor: '#f1f5f9', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontWeight: 'bold', color: '#334155', fontSize: 16, marginBottom: 4 },
  emptyText: { color: '#64748b', fontSize: 13, textAlign: 'center', lineHeight: 18 },

  glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: {width:0, height:8}, shadowOpacity: 0.05, shadowRadius: 15, elevation: 4, overflow: 'hidden' },
  gradientTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#dc2626' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16, marginBottom: 16, marginTop: 4 },
  platBadge: { backgroundColor: '#0f172a', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  platText: { color: 'white', fontWeight: 'bold', fontSize: 12, letterSpacing: 1.5 },
  vehicleName: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  complaintText: { color: '#64748b', marginTop: 4, fontSize: 13 },
  costContainer: { backgroundColor: 'white', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'flex-end', justifyContent: 'center' },
  costLabel: { color: '#94a3b8', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  costValue: { color: '#dc2626', fontSize: 22, fontWeight: '900' },

  // GAYA MEKANIK BERTUGAS
  mechanicContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(248, 250, 252, 0.8)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 },
  mechanicLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  mechanicBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', borderColor: '#dbeafe', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  mechanicBadgePending: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  mechanicText: { fontSize: 12, fontWeight: '900', color: '#2563eb' },
  mechanicTextPending: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
  mechanicPulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6', marginRight: 6 },

  // GAYA STEPPER FLEXBOX BARU (ANTI TERPUTUS)
  trackerWrapper: { marginTop: 10, paddingHorizontal: 5, paddingBottom: 10 },
  trackerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  
  trackCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white', zIndex: 2 },
  trackCircleActive: { backgroundColor: '#dc2626', shadowColor: '#dc2626', shadowOffset:{width:0, height:3}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  trackCircleFinished: { backgroundColor: '#10b981', shadowColor: '#10b981', shadowOffset:{width:0, height:3}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  trackCircleInactive: { backgroundColor: '#f1f5f9', borderColor: '#ffffff' },

  trackLine: { flex: 1, height: 4, zIndex: 1, marginHorizontal: -4 },
  trackLineActive: { backgroundColor: '#dc2626' },
  trackLineFinished: { backgroundColor: '#10b981' },
  trackLineInactive: { backgroundColor: '#e2e8f0' },

  trackerLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 5 },
  trackLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5, width: 70, textAlign: 'center' },
  trackLabelActive: { color: '#dc2626' },
  trackLabelFinished: { color: '#10b981' },
  trackLabelInactive: { color: '#94a3b8' },

  // GAYA NOTIFIKASI SELESAI
  readyNotification: { flexDirection: 'row', backgroundColor: '#ecfdf5', borderColor: '#bbf7d0', borderWidth: 1, padding: 16, borderRadius: 16, marginTop: 24, alignItems: 'center' },
  readyIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginRight: 12, elevation: 2 },
  readyTitle: { fontSize: 13, fontWeight: '900', color: '#064e3b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  readyText: { fontSize: 11, color: '#047857', lineHeight: 16 },

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
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  histPlat: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  histMerek: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  dateBadge: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  histTanggal: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
  histMekanikLabel: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  histMekanik: { fontSize: 13, color: '#334155', fontWeight: 'bold' },
  
  histComplaintBox: { backgroundColor: 'rgba(254, 226, 226, 0.5)', borderColor: 'rgba(254, 202, 202, 0.5)', borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 16, position: 'relative', overflow: 'hidden' },
  histComplaintLabel: { fontSize: 9, fontWeight: '900', color: '#f87171', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  histComplaintText: { fontSize: 12, fontStyle: 'italic', fontWeight: 'bold', color: '#334155' },

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