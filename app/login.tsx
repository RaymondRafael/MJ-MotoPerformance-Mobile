import React from 'react';
import { SafeAreaView } from 'react-native';
import LoginScreen from '../src/Login'; // Memanggil dari folder src

export default function LoginRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
      <LoginScreen />
    </SafeAreaView>
  );
}