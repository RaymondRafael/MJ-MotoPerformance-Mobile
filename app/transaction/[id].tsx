import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ServiceDetailMobile() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter(); 
  
  const [service, setService] = useState<any>(null);
  const [spareparts, setSpareparts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Form
  const [selectedSparepart, setSelectedSparepart] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [serviceCostInput, setServiceCostInput] = useState('0');

  // State untuk Modal Dropdown Suku Cadang
  const [isModalVisible, setIsModalVisible] = useState(false);

  // ⚠️ GANTI IP INI SESUAI DENGAN IP LAPTOP ANDA
  const API_URL = 'http://10.76.124.100:8000/api';

  const fetchServiceDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setService(response.data.data.service);
      setSpareparts(response.data.data.spareparts);
      setServiceCostInput(String(response.data.data.service.service_cost));
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        router.replace('/');
      } else {
        Alert.alert('Error', 'Data tidak ditemukan!');
        router.back();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetail();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === 'finished') {
      Alert.alert(
        'Selesaikan Servis?',
        'Status akan diubah menjadi Selesai dan sistem akan mengirimkan pesan WhatsApp ke pelanggan.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Ya, Selesaikan', onPress: () => processUpdateStatus(newStatus) }
        ]
      );
    } else {
      processUpdateStatus(newStatus);
    }
  };

  const processUpdateStatus = async (newStatus: string) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      await axios.put(`${API_URL}/services/${id}/status`, 
        { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sukses', 'Status pengerjaan berhasil diperbarui!');
      fetchServiceDetail();
    } catch (error) {
      Alert.alert('Gagal', 'Gagal merubah status!');
    }
  };

  const handleAddSparepart = async () => {
    if (!selectedSparepart) return Alert.alert('Perhatian', 'Pilih suku cadang dulu!');
    if (parseInt(quantity) < 1) return Alert.alert('Perhatian', 'Jumlah tidak valid!');
    
    try {
      const token = await AsyncStorage.getItem('auth_token');
      await axios.post(`${API_URL}/services/${id}/sparepart`, 
        { sparepart_id: selectedSparepart.id, quantity: parseInt(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedSparepart(null);
      setQuantity('1');
      fetchServiceDetail();
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal menambahkan suku cadang');
    }
  };

  const handleRemoveSparepart = (detailId: string) => {
    Alert.alert(
      'Hapus Suku Cadang?',
      'Item ini akan dihapus dari nota dan stok akan dikembalikan otomatis.',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('auth_token');
              await axios.delete(`${API_URL}/services/${id}/sparepart/${detailId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchServiceDetail();
            } catch (error) {
              Alert.alert('Gagal', 'Gagal menghapus suku cadang');
            }
          } 
        }
      ]
    );
  };

  const handleUpdateCost = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      await axios.put(`${API_URL}/services/${id}/cost`, 
        { service_cost: parseInt(serviceCostInput) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sukses', 'Biaya jasa mekanik berhasil diperbarui.');
      fetchServiceDetail();
    } catch (error) {
      Alert.alert('Gagal', 'Gagal memperbarui biaya jasa');
    }
  };

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID').format(angka || 0);
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return dateString.substring(0, 16).replace('T', ' '); 
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Memuat Detail Nota...</Text>
      </View>
    );
  }

  if (!service) return null;

  return (
    <View style={styles.container}>
      
      {/* HEADER NAVBAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={16} color="#4b5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Transaksi</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* --- DIPERBARUI: contentContainerStyle --- */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* KARTU INFORMASI KENDARAAN */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>INFORMASI KENDARAAN</Text>
          
          <View style={styles.platContainer}>
            <View style={styles.platBadge}>
              <Text style={styles.platBadgeText}>{service.vehicle?.license_plate || '-'}</Text>
            </View>
            <Text style={styles.motorName}>{service.vehicle?.brand} {service.vehicle?.model}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Pelanggan:</Text>
            <Text style={styles.infoValue}>{service.vehicle?.customer?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>WhatsApp:</Text>
            <Text style={[styles.infoValue, {color: '#16a34a'}]}><FontAwesome5 name="whatsapp" /> {service.vehicle?.customer?.phone_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Mekanik:</Text>
            <Text style={styles.infoValue}>{service.mechanic?.name || 'Belum Ditentukan'}</Text>
          </View>
          <View style={[styles.infoRow, {borderBottomWidth: 0}]}>
            <Text style={styles.infoKey}>Masuk:</Text>
            <Text style={styles.infoValue}>{formatDate(service.created_at)}</Text>
          </View>
        </View>

        {/* KARTU KELUHAN & STATUS (Pakai Tombol Pill) */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>KELUHAN & STATUS</Text>
          
          <View style={styles.complaintBox}>
            <Text style={styles.complaintText}>"{service.complaint}"</Text>
          </View>

          <Text style={[styles.infoKey, {marginBottom: 8}]}>Ubah Status Pengerjaan:</Text>
          <View style={styles.statusContainer}>
            <TouchableOpacity 
              style={[styles.statusBtn, service.status === 'pending' && styles.statusBtnPending]}
              onPress={() => handleUpdateStatus('pending')}
            >
              <Text style={[styles.statusBtnText, service.status === 'pending' && {color: '#854d0e'}]}>Antrean</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusBtn, service.status === 'processing' && styles.statusBtnProcessing]}
              onPress={() => handleUpdateStatus('processing')}
            >
              <Text style={[styles.statusBtnText, service.status === 'processing' && {color: '#1d4ed8'}]}>Diproses</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.statusBtn, service.status === 'finished' && styles.statusBtnFinished]}
              onPress={() => handleUpdateStatus('finished')}
            >
              <Text style={[styles.statusBtnText, service.status === 'finished' && {color: '#15803d'}]}>Selesai</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KARTU TAMBAH SUKU CADANG */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>TAMBAH SUKU CADANG</Text>
          
          <TouchableOpacity style={styles.selectSparepartBtn} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.selectSparepartText}>
              {selectedSparepart ? `${selectedSparepart.name} (Rp ${formatRupiah(selectedSparepart.price)})` : '-- Pilih Barang --'}
            </Text>
            <FontAwesome5 name="chevron-down" size={12} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.addFormRow}>
            <View style={styles.qtyContainer}>
              <Text style={styles.qtyLabel}>Jumlah:</Text>
              <TextInput 
                style={styles.qtyInput}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddSparepart}>
              <FontAwesome5 name="plus" color="white" size={12} />
              <Text style={styles.addBtnText}>Tambah</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KARTU RINCIAN NOTA */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>RINCIAN BIAYA</Text>
          
          {/* Baris Jasa Mekanik */}
          <View style={styles.notaRow}>
            <View style={{flex: 1}}>
              <Text style={styles.notaItemName}>Biaya Jasa Mekanik</Text>
              <Text style={styles.notaItemSub}>Bisa diubah manual</Text>
            </View>
            
            <View style={styles.costEditContainer}>
              <Text style={{fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginRight: 5}}>Rp</Text>
              <TextInput 
                style={styles.costInput}
                keyboardType="numeric"
                value={serviceCostInput}
                onChangeText={setServiceCostInput}
              />
              <TouchableOpacity style={styles.saveCostBtn} onPress={handleUpdateCost}>
                <FontAwesome5 name="check" size={10} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Baris Sparepart */}
          {service.details && service.details.map((detail: any) => (
            <View key={detail.id} style={styles.notaRow}>
              <View style={{flex: 1}}>
                <Text style={styles.notaItemName}>{detail.sparepart?.name}</Text>
                <Text style={styles.notaItemSub}>{detail.quantity}x Rp {formatRupiah(detail.price)}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.notaSubtotal}>Rp {formatRupiah(detail.subtotal)}</Text>
                <TouchableOpacity onPress={() => handleRemoveSparepart(detail.id)} style={{marginTop: 5}}>
                  <Text style={{color: '#dc2626', fontSize: 10, fontWeight: 'bold'}}><FontAwesome5 name="trash" /> Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Total Tagihan */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL TAGIHAN</Text>
            <Text style={styles.totalValue}>Rp {formatRupiah(service.total_cost)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* MODAL PILIH SUKU CADANG */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Suku Cadang</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <FontAwesome5 name="times" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            
            {/* --- DIPERBARUI: contentContainerStyle --- */}
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {spareparts.map((sp) => (
                <TouchableOpacity 
                  key={sp.id} 
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSparepart(sp);
                    setIsModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemName}>{sp.name}</Text>
                  <Text style={styles.modalItemSub}>Rp {formatRupiah(sp.price)} | Sisa Stok: {sp.stock}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// --- DESAIN STYLING NATIVE ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  loadingText: { marginTop: 10, color: '#6b7280', fontWeight: 'bold' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 40, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { padding: 10, backgroundColor: '#f3f4f6', borderRadius: 8 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  
  // --- DIPERBARUI: Tambahan paddingBottom untuk ScrollView Utama ---
  scrollContent: { padding: 16, paddingBottom: 100 },
  
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 1, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 6 },
  
  // Kendaraan Info
  platContainer: { alignItems: 'center', marginBottom: 16 },
  platBadge: { backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, marginBottom: 6 },
  platBadgeText: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  motorName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  infoKey: { color: '#6b7280', fontSize: 13 },
  infoValue: { color: '#111827', fontSize: 13, fontWeight: 'bold' },

  // Keluhan & Status
  complaintBox: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 },
  complaintText: { color: '#4b5563', fontSize: 13, fontStyle: 'italic' },
  
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statusBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginHorizontal: 2, backgroundColor: '#f9fafb' },
  statusBtnText: { fontSize: 11, fontWeight: 'bold', color: '#6b7280' },
  statusBtnPending: { backgroundColor: '#fef08a', borderColor: '#eab308' },
  statusBtnProcessing: { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
  statusBtnFinished: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },

  // Form Sparepart
  selectSparepartBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 8, marginBottom: 12 },
  selectSparepartText: { fontSize: 13, color: '#111827', fontWeight: 'bold' },
  addFormRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  qtyContainer: { flex: 1, marginRight: 10 },
  qtyLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 'bold' },
  qtyInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 14, textAlign: 'center' },
  addBtn: { backgroundColor: '#111827', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 6 },

  // Rincian Nota
  // Pastikan alignItems center agar teks kiri sejajar sempurna dengan kotak input yang baru
  notaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  notaItemName: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  notaItemSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  notaSubtotal: { fontSize: 14, fontWeight: '900', color: '#111827' },
  
  costEditContainer: { flexDirection: 'row', alignItems: 'center' },
  
  // --- DIPERKECIL SEDIKIT TAPI TETAP AMAN DARI TERPOTONG ---
  costInput: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 8, 
    
    // Ukuran diturunkan ke titik proporsional
    width: 110, 
    height: 42,  
    
    // Trik anti-terpotong Android TETAP DIPERTAHANKAN
    paddingHorizontal: 10, 
    paddingVertical: 0, 
    textAlignVertical: 'center', 
    
    fontSize: 14, // Font sedikit dikecilkan
    textAlign: 'right', 
    fontWeight: '900', 
    color: '#111827',
    backgroundColor: '#f9fafb'
  },
  
  // Tombol disesuaikan ukurannya agar sejajar dengan input
  saveCostBtn: { 
    backgroundColor: '#3b82f6', 
    width: 42,  
    height: 42, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 8 
  },

  totalBox: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, fontWeight: '900', color: '#991b1b' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#dc2626' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  
  // --- DIPERBARUI: Tambahan paddingBottom untuk Scroll Modal ---
  modalScrollContent: { paddingBottom: 60 },
  
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalItemName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  modalItemSub: { fontSize: 12, color: '#6b7280', marginTop: 4 }
});