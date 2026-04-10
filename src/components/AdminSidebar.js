import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, usePathname } from "expo-router";

export default function AdminSidebar({ visible, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const screenWidth = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(screenWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(screenWidth, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    onClose();
    router.replace("/");
  };

  const navigateTo = (route) => {
    onClose();
    router.push(route);
  };

  const MenuItem = ({ icon, label, route }) => {
    const isActive = pathname === route;
    return (
      <TouchableOpacity
        style={[styles.menuItem, isActive ? styles.menuItemActive : null]}
        onPress={() => navigateTo(route)}
      >
        <View style={styles.iconContainer}>
          <FontAwesome5
            name={icon}
            size={16}
            color={isActive ? "#dc2626" : "#6b7280"}
          />
        </View>
        <Text
          style={[styles.menuLabel, isActive ? styles.menuLabelActive : null]}
        >
          {label}
        </Text>
        {isActive ? <View style={styles.activeIndicator} /> : null}
      </TouchableOpacity>
    );
  };

  // BAGIAN INI DIRAPATKAN 100% AGAR TIDAK ADA CELAH SPASI SILUMAN
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.sidebarContainer,
            { transform: [{ translateX: screenWidth }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.logoText}>
              MJ MOTO<Text style={styles.logoRed}>ADMIN</Text>
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          <View style={styles.menuContainer}>
            <Text style={styles.sectionLabel}>Navigasi Utama</Text>
            <MenuItem
              icon="chart-pie"
              label="Dasbor Ringkasan"
              route="/admin"
            />
            <MenuItem
              icon="file-invoice-dollar"
              label="Transaksi Servis"
              route="/transactions"
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <FontAwesome5 name="sign-out-alt" size={14} color="#dc2626" />
              <Text style={styles.logoutText}>LOGOUT</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row" },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sidebarContainer: {
    width: 280,
    backgroundColor: "white",
    height: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  logoText: { fontSize: 20, fontWeight: "900", color: "#111827" },
  logoRed: { color: "#ef4444" },
  closeButton: { padding: 5 },
  menuContainer: { padding: 15, flex: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 15,
    marginLeft: 10,
  },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 15 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  menuItemActive: { backgroundColor: "#fee2e2" },
  iconContainer: { width: 25, alignItems: "center", marginRight: 15 },
  menuLabel: { fontSize: 14, fontWeight: "bold", color: "#4b5563" },
  menuLabelActive: { color: "#dc2626" },
  activeIndicator: {
    position: "absolute",
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#dc2626",
  },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutText: {
    color: "#dc2626",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 14,
  },
});
