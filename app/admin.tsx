import { SafeAreaView } from 'react-native';
import AdminDashboard from '../src/AdminDashboard';

export default function AdminPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <AdminDashboard />
    </SafeAreaView>
  );
}