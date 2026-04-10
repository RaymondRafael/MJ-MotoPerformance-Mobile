import React, { useState, useCallback } from 'react'; // Ganti useEffect jadi useCallback
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router'; // Tambahkan useFocusEffect
import AdminSidebar from './components/AdminSidebar';

export default function AdminTransactions() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const router = useRouter();

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      // ⚠️ Pastikan IP ini adalah IP Laptop Anda 
      const response = await axios.get('http://10.76.124.100:8000/api/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.data);
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

  // ✅ GANTI DENGAN KODE INI
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID').format(angka || 0);

  // LOGIKA PENCARIAN YANG SUDAH DISESUAIKAN DENGAN LARAVEL (Aman dari Crash)
  const filteredTransactions = transactions.filter(t => {
    const plat = t.vehicle?.license_plate || '';
    const nama = t.vehicle?.customer?.name || '';
    const search = searchQuery.toLowerCase();
    
    return plat.toLowerCase().includes(search) || nama.toLowerCase().includes(search);
  });

  return (
    <View style={styles.container}>
      
      <AdminSidebar visible={isSidebarVisible} onClose={() => setIsSidebarVisible(false)} />

      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={() => setIsSidebarVisible(true)} style={styles.hamburgerButton}>
            <FontAwesome5 name="bars" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.logoText}>MJ MOTO<Text style={styles.logoRed}>PERFORMANCE</Text></Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-transaction')}>
          <FontAwesome5 name="plus" size={12} color="white" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerTitle}>
          <Text style={styles.pageTitle}>Transaksi Servis</Text>
          <Text style={styles.pageSubtitle}>Daftar seluruh nota pengerjaan bengkel.</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <FontAwesome5 name="search" size={14} color="#9ca3af" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Cari Plat Motor atau Nama Pelanggan..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#ef4444" style={{ marginTop: 40 }} />
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <FontAwesome5 name="search" size={40} color="#e5e7eb" style={{marginBottom: 10}} />
            <Text style={styles.emptyText}>Transaksi tidak ditemukan.</Text>
          </View>
        ) : (
          filteredTransactions.map((nota) => (
            <View key={nota.id} style={styles.notaCard}>
              <View style={styles.cardHeader}>
                <View>
                  <View style={styles.platBadge}>
                    {/* Menggunakan license_plate */}
                    <Text style={styles.platText}>{nota.vehicle?.license_plate || 'N/A'}</Text>
                  </View>
                  {/* Menggabungkan brand dan model */}
                  <Text style={styles.vehicleName}>{nota.vehicle?.brand} {nota.vehicle?.model}</Text>
                  <Text style={styles.customerName}>Pelanggan: <Text style={{fontWeight: 'bold', color: '#4b5563'}}>{nota.vehicle?.customer?.name}</Text></Text>
                </View>
                
                <View style={styles.rightHeader}>
                  {/* Memotong format tanggal bawaan database agar lebih rapi */}
                  <Text style={styles.dateText}>{nota.created_at ? nota.created_at.substring(0, 10) : '-'}</Text>
                  
                  {/* Menyesuaikan badge dengan status dari Laravel */}
                  {nota.status === 'finished' && (
                    <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                      <Text style={[styles.badgeText, { color: '#166534' }]}>SELESAI</Text>
                    </View>
                  )}
                  {nota.status === 'processing' && (
                    <View style={[styles.badge, { backgroundColor: '#bfdbfe' }]}>
                      <Text style={[styles.badgeText, { color: '#1e40af' }]}>DIPROSES</Text>
                    </View>
                  )}
                  {nota.status === 'pending' && (
                    <View style={[styles.badge, { backgroundColor: '#fef08a' }]}>
                      <Text style={[styles.badgeText, { color: '#854d0e' }]}>ANTREAN</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.mekanikInfo}>
                  <FontAwesome5 name="user-cog" size={11} color="#9ca3af" />
                  {/* Menggunakan relasi mechanic.name */}
                  <Text style={styles.mekanikText}> Mekanik: {nota.mechanic?.name || 'Belum dipilih'}</Text>
                </View>
                <View style={styles.costInfo}>
                  <Text style={styles.costLabel}>Total Biaya</Text>
                  {/* Menggunakan total_cost */}
                  <Text style={styles.costValue}>Rp {formatRupiah(nota.total_cost)}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/transaction/${nota.id}`)}>
                  <FontAwesome5 name="eye" size={12} color="#111827" />
                  <Text style={styles.actionText}>Detail</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/edit-transaction/${nota.id}`)}>
                    <FontAwesome5 name="edit" size={12} color="#2563eb" />
                    <Text style={[styles.actionText, {color: '#2563eb'}]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, {borderRightWidth: 0}]}>
                  <FontAwesome5 name="trash-alt" size={12} color="#dc2626" />
                  <Text style={[styles.actionText, {color: '#dc2626'}]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 40, backgroundColor: '#111827' },
  navLeft: { flexDirection: 'row', alignItems: 'center' },
  hamburgerButton: { padding: 8, marginRight: 10, marginLeft: -8 },
  logoText: { color: 'white', fontSize: 16, fontWeight: '900' },
  logoRed: { color: '#ef4444' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 6 },
  // Menggunakan paddingBottom: 100 agar kartu terbawah tidak tertutup tombol navigasi HP
  scrollContent: { padding: 16, paddingBottom: 100 },
  headerTitle: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  pageSubtitle: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  searchSection: { flexDirection: 'row', marginBottom: 20 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#111827' },
  emptyCard: { backgroundColor: 'white', padding: 40, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
  emptyText: { color: '#9ca3af', fontWeight: 'bold', fontSize: 14 },
  notaCard: { backgroundColor: 'white', borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  platBadge: { backgroundColor: '#111827', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
  platText: { color: 'white', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5 },
  vehicleName: { fontSize: 16, fontWeight: '900', color: '#111827' },
  customerName: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  rightHeader: { alignItems: 'flex-end' },
  dateText: { fontSize: 11, fontWeight: 'bold', color: '#9ca3af', marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  cardBody: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#f9fafb' },
  mekanikInfo: { flexDirection: 'row', alignItems: 'center' },
  mekanikText: { fontSize: 11, color: '#6b7280' },
  costInfo: { alignItems: 'flex-end' },
  costLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase' },
  costValue: { fontSize: 18, fontWeight: '900', color: '#111827', marginTop: 2 },
  cardActions: { flexDirection: 'row', backgroundColor: 'white' },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRightWidth: 1, borderRightColor: '#f3f4f6' },
  actionText: { fontSize: 12, fontWeight: 'bold', color: '#111827', marginLeft: 6 }
  
});