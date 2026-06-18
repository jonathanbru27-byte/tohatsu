import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ContactModal from '@/src/components/ContactModal';
import { getConfig, Configuracion } from '@/src/services/api';
import CustomTabBar from '@/src/components/CustomTabBar';

export default function ContactScreen() {
  const router = useRouter();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'ventas' | 'repuestos' | 'servicio'>('ventas');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await getConfig();
      setConfig(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'ventas' | 'repuestos' | 'servicio') => {
    if (!config) return;
    setModalType(type);
    setModalVisible(true);
  };

  const getModalData = () => {
    if (!config) return { title: '', phone: '' };
    switch (modalType) {
      case 'ventas':
        return { title: 'Visita de Asesor', phone: config.whatsapp_ventas };
      case 'repuestos':
        return { title: 'Pedido de Repuestos', phone: config.whatsapp_repuestos };
      case 'servicio':
        return { title: 'Servicio Técnico', phone: config.whatsapp_servicio };
    }
  };

  const modalData = getModalData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacto</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroBox}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="chatbubbles" size={40} color="#E63946" />
            </View>
            <Text style={styles.heroTitle}>¿Cómo podemos ayudarte?</Text>
            <Text style={styles.heroSubtitle}>
              Elige el servicio que necesitas y te contactaremos por WhatsApp al instante
            </Text>
          </View>

          <View style={styles.sectionTitle}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitleText}>NUESTROS SERVICIOS</Text>
          </View>

          <TouchableOpacity
            style={[styles.serviceCard, { backgroundColor: '#E63946' }]}
            onPress={() => openModal('ventas')}
            testID="contact-ventas-button"
          >
            <View style={styles.serviceIconWrap}>
              <Ionicons name="person" size={32} color="#fff" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>VISITA DE ASESOR</Text>
              <Text style={styles.serviceDescription}>
                Un experto irá a tu ubicación para asesorarte
              </Text>
            </View>
            <View style={styles.whatsappBadge}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.serviceCard, { backgroundColor: '#27AE60' }]}
            onPress={() => openModal('repuestos')}
            testID="contact-repuestos-button"
          >
            <View style={styles.serviceIconWrap}>
              <Ionicons name="construct" size={32} color="#fff" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>REPUESTOS ORIGINALES</Text>
              <Text style={styles.serviceDescription}>
                Solicita repuestos genuinos Tohatsu
              </Text>
            </View>
            <View style={styles.whatsappBadge}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.serviceCard, { backgroundColor: '#E67E22' }]}
            onPress={() => openModal('servicio')}
            testID="contact-servicio-button"
          >
            <View style={styles.serviceIconWrap}>
              <Ionicons name="build" size={32} color="#fff" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>SERVICIO TÉCNICO</Text>
              <Text style={styles.serviceDescription}>
                Mantenimiento por técnicos certificados
              </Text>
            </View>
            <View style={styles.whatsappBadge}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.calendarLink}
            onPress={() => router.push('/client/calendar')}
            testID="calendar-link"
          >
            <Ionicons name="calendar" size={20} color="#E63946" />
            <Text style={styles.calendarLinkText}>Ver Calendario de Mantenimientos Gratuitos</Text>
            <Ionicons name="chevron-forward" size={20} color="#E63946" />
          </TouchableOpacity>
        </ScrollView>
      )}

      <CustomTabBar />

      <ContactModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalData.title}
        phoneNumber={modalData.phone}
        interes={modalType === 'ventas' ? 'motor' : modalType === 'repuestos' ? 'repuesto' : 'servicio'}
        detalle={modalData.title}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  heroBox: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitleBar: {
    width: 24,
    height: 3,
    backgroundColor: '#E63946',
    borderRadius: 2,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 1.5,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    gap: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
  },
  whatsappBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarLinkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
