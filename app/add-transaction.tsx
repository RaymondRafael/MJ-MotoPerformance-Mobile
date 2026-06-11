import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function AddTransactionMobile() {
  const router = useRouter();

  // State Data dari Laravel (Ditambah <any> agar bebas error merah TypeScript)
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State Form
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedMechanic, setSelectedMechanic] = useState<any>(null);
  const [complaint, setComplaint] = useState<string>('');

  // State Modal
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState<boolean>(false);
  const [isMechanicModalVisible, setIsMechanicModalVisible] = useState<boolean>(false);

  const API_URL = 'https://swiftness-shifter-promotion.ngrok-free.dev/api';

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const response = await axios.get(`${API_URL}/services/create`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVehicles(response.data.data.vehicles);
        setMechanics(response.data.data.mechanics);
      } catch (error: any) {
        console.error("Gagal memuat data form", error);
        if (error.response?.status === 401) {
          await AsyncStorage.clear();
          router.replace('/');
        } else {
          Alert.alert('Error', 'Gagal terhubung ke server database.');
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchFormData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedVehicle) return Alert.alert('Perhatian', 'Pilih kendaraan terlebih dahulu!');
    if (!selectedMechanic) return Alert.alert('Perhatian', 'Pilih mekanik terlebih dahulu!');
    if (!complaint.trim()) return Alert.alert('Perhatian', 'Keluhan tidak boleh kosong!');

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      await axios.post(`${API_URL}/services`, {
        vehicle_id: selectedVehicle.id,
        mechanic_id: selectedMechanic.id,
        complaint: complaint
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Sukses', 'Antrean servis berhasil dibuat!');
      // Kembali ke halaman daftar transaksi
      router.back();
    } catch (error: any) {
      console.error("Gagal menyimpan data", error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Memuat formulir...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* HEADER NAVBAR */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={16} color="#4b5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buka Antrean Baru</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* Area Scroll dengan padding bawah ekstra agar tidak tertutup */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="clipboard-check" size={18} color="#ef4444" />
            <Text style={styles.cardTitle}>Formulir Servis</Text>
          </View>

          {/* INPUT: KENDARAAN (Memicu Modal) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pilih Kendaraan (Plat Nomor) <Text style={{color: '#ef4444'}}>*</Text></Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsVehicleModalVisible(true)}>
              <Text style={[styles.dropdownText, !selectedVehicle && {color: '#9ca3af'}]}>
                {selectedVehicle ? `${selectedVehicle.license_plate} (${selectedVehicle.customer?.name})` : '-- Ketuk untuk Memilih Kendaraan --'}
              </Text>
              <FontAwesome5 name="chevron-down" size={12} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* INPUT: MEKANIK (Memicu Modal) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pilih Mekanik <Text style={{color: '#ef4444'}}>*</Text></Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsMechanicModalVisible(true)}>
              <Text style={[styles.dropdownText, !selectedMechanic && {color: '#9ca3af'}]}>
                {selectedMechanic ? selectedMechanic.name : '-- Ketuk untuk Memilih Mekanik --'}
              </Text>
              <FontAwesome5 name="chevron-down" size={12} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* INPUT: KELUHAN */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Keluhan Pelanggan <Text style={{color: '#ef4444'}}>*</Text></Text>
            <TextInput 
              style={styles.textArea}
              multiline={true}
              numberOfLines={4}
              placeholder="Contoh: Tarikan gas berat, minta ganti oli gardan..."
              value={complaint}
              onChangeText={setComplaint}
              textAlignVertical="top"
            />
          </View>

          {/* TOMBOL AKSI */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} disabled={isSubmitting}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && { backgroundColor: '#f87171' }]} 
              onPress={handleSubmit} 
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>{isSubmitting ? 'Menyimpan...' : 'Mulai Antrean'}</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>

      {/* --- MODAL PILIH KENDARAAN --- */}
      <Modal visible={isVehicleModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daftar Kendaraan</Text>
              <TouchableOpacity onPress={() => setIsVehicleModalVisible(false)}>
                <FontAwesome5 name="times" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {vehicles.map((v) => (
                <TouchableOpacity 
                  key={v.id} 
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedVehicle(v);
                    setIsVehicleModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemName}>{v.license_plate}</Text>
                  <Text style={styles.modalItemSub}>{v.brand} {v.model} | Pemilik: {v.customer?.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL PILIH MEKANIK --- */}
      <Modal visible={isMechanicModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daftar Mekanik Tersedia</Text>
              <TouchableOpacity onPress={() => setIsMechanicModalVisible(false)}>
                <FontAwesome5 name="times" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {mechanics.map((m) => (
                <TouchableOpacity 
                  key={m.id} 
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedMechanic(m);
                    setIsMechanicModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemName}>{m.name}</Text>
                  <Text style={styles.modalItemSub}>No. HP: {m.phone_number || '-'}</Text>
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
  
  // RUANG KOSONG BAWAH
  scrollContent: { padding: 16, paddingBottom: 100 },
  
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginLeft: 10 },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  
  // Tombol Dropdown Palsu
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', padding: 14, borderRadius: 10, backgroundColor: '#f9fafb' },
  dropdownText: { fontSize: 14, color: '#111827', fontWeight: 'bold' },
  
  // Kotak Keluhan
  textArea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 14, fontSize: 14, backgroundColor: '#f9fafb', height: 100, color: '#111827' },

  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', marginRight: 10 },
  cancelBtnText: { color: '#4b5563', fontWeight: 'bold', fontSize: 14 },
  submitBtn: { backgroundColor: '#dc2626', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '65%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  modalScrollContent: { paddingBottom: 60 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalItemName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  modalItemSub: { fontSize: 12, color: '#6b7280', marginTop: 4 }
});