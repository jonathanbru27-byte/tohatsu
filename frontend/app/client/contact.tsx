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
import { Ionicons } from '@expo/vector-icons';
import ContactModal from '@/src/components/ContactModal';
import { getConfig, Configuracion } from '@/src/services/api';

export default function ContactScreen() {
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'ventas' | 'repuestos' | 'servicio') => {
    if (!config) {
      Alert.alert('Error', 'No se ha configurado el número de WhatsApp');
      return;
    }
    setModalType(type);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  const getModalData = () => {
    if (!config) return { title: '', phone: '' };
    
    switch (modalType) {
      case 'ventas':
        return {
          title: 'Visita de Asesor',
          phone: config.whatsapp_ventas,
        };
      case 'repuestos':
        return {
          title: 'Pedido de Repuestos',
          phone: config.whatsapp_repuestos,
        };
      case 'servicio':
        return {
          title: 'Servicio Técnico',
          phone: config.whatsapp_servicio,
        };
      default:
        return { title: '', phone: '' };
    }
  };

  const modalData = getModalData();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={48} color="#0066cc" />
        <Text style={styles.title}>¿En qué podemos ayudarte?</Text>
        <Text style={styles.subtitle}>
          Selecciona el servicio que necesitas y te contactaremos por WhatsApp
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, styles.ventasCard]}
          onPress={() => openModal('ventas')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Quiero que me visite un asesor</Text>
          <Text style={styles.cardDescription}>
            Un experto visitará tu ubicación para asesorarte personalmente
          </Text>
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Solicitar visita</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.repuestosCard]}
          onPress={() => openModal('repuestos')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="construct" size={40} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Pedido de repuestos originales</Text>
          <Text style={styles.cardDescription}>
            Solicita repuestos genuinos Tohatsu para tu motor
          </Text>
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Pedir repuestos</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.servicioCard]}
          onPress={() => openModal('servicio')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="build" size={40} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Servicio técnico</Text>
          <Text style={styles.cardDescription}>
            Mantenimiento y reparación de tu motor por técnicos certificados
          </Text>
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Solicitar servicio</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <ContactModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalData.title}
        phoneNumber={modalData.phone}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  ventasCard: {
    backgroundColor: '#0066cc',
  },
  repuestosCard: {
    backgroundColor: '#00994d',
  },
  servicioCard: {
    backgroundColor: '#ff6600',
  },
  cardIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 20,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    justifyContent: 'center',
  },
  cardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
