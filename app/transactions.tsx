import { SafeAreaView } from 'react-native';
// Pastikan path ke AdminTransactions sudah benar
import AdminTransactions from '../src/AdminTransactions'; 

export default function TransactionsPage() {
  return (
    // Gunakan SafeAreaView agar tidak tertutup notch/poni HP
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
      <AdminTransactions />
    </SafeAreaView>
  );
}