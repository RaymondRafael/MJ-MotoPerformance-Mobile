import { SafeAreaView } from 'react-native';
import MyGarageMobile from '../src/MyGarage';

// Kata "export default" di bawah ini WAJIB ada
export default function DashboardPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
      <MyGarageMobile />
    </SafeAreaView>
  );
}