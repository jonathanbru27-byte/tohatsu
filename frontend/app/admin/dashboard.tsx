import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/contexts/AuthContext';
import { getLeadsExportUrl } from '@/src/services/api';

export default function DashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleDownloadLeads = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Sesión expirada', 'Por favor inicia sesión nuevamente');
        setDownloading(false);
        return;
      }
      const url = getLeadsExportUrl();
      const filename = `leads_tohatsu_${new Date().toISOString().slice(0, 10)}.xlsx`;

      if (Platform.OS === 'web') {
        // Browser flow: fetch -> blob -> download anchor
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        // @ts-ignore - web only
        const a = (globalThis as any).document?.createElement('a');
        if (a) {
          a.href = objectUrl;
          a.download = filename;
          a.click();
          setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        }
      } else {
        // Native flow: fetch as base64 then write to file and share
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        // @ts-ignore - btoa available in RN runtime via core-js polyfill
        const base64 = (globalThis as any).btoa
          ? (globalThis as any).btoa(binary)
          : Buffer.from(binary, 'binary').toString('base64');

        const file = new File(Paths.cache, filename);
        if (file.exists) {
          file.delete();
        }
        file.create();
        file.write(base64, { encoding: 'base64' });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Leads Tohatsu',
            UTI: 'org.openxmlformats.spreadsheetml.sheet',
          });
        } else {
          Alert.alert('Archivo descargado', `Guardado en:\n${file.uri}`);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo descargar el archivo de leads');
    } finally {
      setDownloading(false);
    }
  };

  const menuItems = [
    {
      id: 'motors',
      title: 'Gestionar Motores',
      description: 'Agregar, editar o eliminar motores del catálogo',
      icon: 'boat' as const,
      route: '/admin/motors',
      color: '#0066cc',
    },
    {
      id: 'repuestos',
      title: 'Gestionar Repuestos',
      description: 'Agregar, editar o eliminar repuestos con imagen y descripción',
      icon: 'construct' as const,
      route: '/admin/repuestos',
      color: '#0A1F44',
    },
    {
      id: 'calendar',
      title: 'Gestionar Calendario',
      description: 'Programar eventos de mantenimiento gratuito',
      icon: 'calendar' as const,
      route: '/admin/calendar',
      color: '#00994d',
    },
    {
      id: 'asesores',
      title: 'Asesores por Zona',
      description: 'Gestionar asesores por provincia para enrutar leads',
      icon: 'people' as const,
      route: '/admin/asesores',
      color: '#8E44AD',
    },
    {
      id: 'config',
      title: 'Configuración',
      description: 'Números de WhatsApp generales y otros ajustes',
      icon: 'settings' as const,
      route: '/admin/config',
      color: '#ff6600',
    },
  ];

  return (
    <LinearGradient colors={['#0066cc', '#004999']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Panel de Administración</Text>
            <Text style={styles.subtitle}>Tohatsu Motors</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} testID="logout-button">
            <Ionicons name="log-out" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.leadsCard}
            onPress={handleDownloadLeads}
            disabled={downloading}
            testID="download-leads-button"
          >
            <View style={styles.leadsIconContainer}>
              {downloading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="cloud-download" size={28} color="#fff" />
              )}
            </View>
            <View style={styles.leadsInfo}>
              <Text style={styles.leadsTitle}>Descargar Leads (Excel)</Text>
              <Text style={styles.leadsDescription}>
                {downloading ? 'Descargando archivo...' : 'Exporta todos los clientes registrados'}
              </Text>
            </View>
            <Ionicons name="download-outline" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>GESTIÓN</Text>

          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => router.push(item.route as any)}
              testID={`menu-${item.id}`}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={28} color="#fff" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#0066cc" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  leadsCard: {
    backgroundColor: '#E63946',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  leadsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leadsInfo: { flex: 1 },
  leadsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  leadsDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.95,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
    opacity: 0.85,
    marginTop: 16,
    marginBottom: 4,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 14,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: { flex: 1 },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },
});
