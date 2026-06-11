import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#0066cc', '#004999', '#003366']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Ionicons name="boat" size={80} color="#fff" />
          <Text style={styles.title}>Tohatsu Motors</Text>
          <Text style={styles.subtitle}>Motores Fuera de Borda</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.clientButton}
              onPress={() => router.push('/client')}
            >
              <Ionicons name="grid" size={24} color="#0066cc" />
              <Text style={styles.clientButtonText}>Ver Catálogo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/admin/login')}
            >
              <Ionicons name="settings" size={24} color="#fff" />
              <Text style={styles.adminButtonText}>Administrador</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
    marginBottom: 64,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  clientButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  clientButtonText: {
    color: '#0066cc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  adminButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
