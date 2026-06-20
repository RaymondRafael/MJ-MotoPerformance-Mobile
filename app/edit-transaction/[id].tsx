import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function EditTransactionMobile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // State
  const [service, setService] = useState<any>(null);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State Form 
  const [selectedMechanic, setSelectedMechanic] = useState<any>(null);
  const [complaint, setComplaint] = useState<string>('');

  // State Modal
  const [isMechanicModalVisible, setIsMechanicModalVisible] = useState<boolean>(false);

  const API_URL = 'https://swiftness-shifter-promotion.ngrok-free.dev/api';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        
        // Mengambil detail servis & daftar mekanik secara bersamaan
        const [serviceRes, formRes] = await Promise.all([
          axios.get(`${API_URL}/services/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/services/create`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const serviceData = serviceRes.data.data.service;
        const mechanicsData = formRes.data.data.mechanics;

        setService(serviceData);
        setMechanics(mechanicsData);
        
        // Set isi form bawaan
        setComplaint(serviceData.complaint || '');
        
        // Cari mekanik yang sedang bertugas untuk dipilih otomatis
        if (serviceData.mechanic_id) {
          const currentMechanic = mechanicsData.find((m: any) => m.id === serviceData.mechanic_id);
          if (currentMechanic) setSelectedMechanic(currentMechanic);
        }

      } catch (error: any) {
        console.error("Gagal memuat data", error);
        if (error.response?.status === 401) {
          await AsyncStorage.clear();
          router.replace('/');
        } else {
          Alert.alert('Error', 'Gagal memuat data servis.');
          router.back();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleUpdate = async () => {
    if (!complaint.trim()) return Alert.alert('Perhatian', 'Keluhan tidak boleh kosong!');

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      // Mengirim request PUT ke Laravel
      await axios.put(`${API_URL}/services/${id}`, {
        mechanic_id: selectedMechanic ? selectedMechanic.id : null,
        complaint: complaint
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Sukses', 'Informasi servis berhasil diperbarui!');
      router.back();
    } catch (error: any) {
      console.error("Gagal update data", error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan perubahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !service) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Memuat data servis...</Text>
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
        <Text style={styles.headerTitle}>Edit Informasi Servis</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="info-circle" size={18} color="#4b5563" />
            <Text style={styles.cardTitle}>Detail Kendaraan</Text>
          </View>

          {/* INPUT TERKUNCI: PELANGGAN */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Pelanggan</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{service.vehicle?.customer?.name || 'Tidak diketahui'}</Text>
            </View>
          </View>

          {/* INPUT TERKUNCI: PLAT KENDARAAN */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Kendaraan (Plat)</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>
                {service.vehicle?.brand} {service.vehicle?.model} ({service.vehicle?.license_plate})
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* INPUT BISA DIEDIT: MEKANIK */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mekanik yang Bertugas</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsMechanicModalVisible(true)}>
              <Text style={[styles.dropdownText, !selectedMechanic && {color: '#9ca3af'}]}>
                {selectedMechanic ? selectedMechanic.name : '-- Pilih Mekanik --'}
              </Text>
              <FontAwesome5 name="chevron-down" size={12} color="#9ca3af" />
            </TouchableOpacity>
            <Text style={styles.helperText}>Pilih atau ubah mekanik yang menangani kendaraan ini.</Text>
          </View>

          {/* INPUT BISA DIEDIT: KELUHAN */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Keluhan Pelanggan <Text style={{color: '#ef4444'}}>*</Text></Text>
            <TextInput 
              style={styles.textArea}
              multiline={true}
              numberOfLines={4}
              value={complaint}
              onChangeText={setComplaint}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>Revisi atau tambahkan detail keluhan kendaraan dari pelanggan.</Text>
          </View>

          {/* TOMBOL SIMPAN */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && { backgroundColor: '#f87171' }]} 
              onPress={handleUpdate} 
              disabled={isSubmitting}
            >
              <FontAwesome5 name="save" color="white" size={14} style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

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
              
              {/* Pilihan untuk mengosongkan mekanik */}
              <TouchableOpacity 
                style={styles.modalItem}
                onPress={() => {
                  setSelectedMechanic(null);
                  setIsMechanicModalVisible(false);
                }}
              >
                <Text style={styles.modalItemName}>-- Belum Ditentukan --</Text>
              </TouchableOpacity>

              {mechanics.map((m) => (
                <TouchableOpacity 
                  key={m.id} 
                  style={[styles.modalItem, selectedMechanic?.id === m.id && { backgroundColor: '#fef2f2' }]}
                  onPress={() => {
                    setSelectedMechanic(m);
                    setIsMechanicModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemName, selectedMechanic?.id === m.id && { color: '#dc2626' }]}>
                    {m.name}
                  </Text>
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
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 10, color: '#6b7280', fontWeight: 'bold' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 40, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { padding: 10, backgroundColor: '#f3f4f6', borderRadius: 8 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  
  scrollContent: { padding: 16, paddingBottom: 100 },
  
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginLeft: 10 },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  helperText: { fontSize: 11, color: '#9ca3af', marginTop: 6 },
  
  // Input Terkunci (Disabled)
  disabledInput: { backgroundColor: '#f3f4f6', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  disabledText: { color: '#6b7280', fontSize: 14, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 20, borderStyle: 'dashed' },

  // Tombol Dropdown Palsu
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', padding: 14, borderRadius: 10, backgroundColor: 'white' },
  dropdownText: { fontSize: 14, color: '#111827', fontWeight: 'bold' },
  
  // Kotak Keluhan
  textArea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 14, fontSize: 14, backgroundColor: 'white', height: 100, color: '#111827' },

  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dc2626', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10, shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  modalScrollContent: { paddingBottom: 60 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingHorizontal: 10, borderRadius: 8 },
  modalItemName: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  modalItemSub: { fontSize: 12, color: '#6b7280', marginTop: 4 }
});