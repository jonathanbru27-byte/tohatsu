import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMotor, getConfig, Motor, Configuracion } from '@/src/services/api';
import ContactModal from '@/src/components/ContactModal';

export default function MotorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [motor, setMotor] = useState<Motor | null>(null);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      if (!id) return;
      const [motorData, configData] = await Promise.all([getMotor(id), getConfig()]);
      setMotor(motorData);
      setConfig(configData);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el motor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      </SafeAreaView>
    );
  }

  if (!motor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Motor no encontrado</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLinkButton}>
            <Text style={styles.backLinkText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const montoFinanciado = motor.precio - motor.financiamiento_entrada;
  const cuotaMensual = Math.round(montoFinanciado / motor.financiamiento_cuotas);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} testID="back-button">
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="heart-outline" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageCard}>
          <Image source={{ uri: motor.imagen }} style={styles.motorImage} resizeMode="cover" />
          {motor.badge_text ? (
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{motor.badge_text}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.motorTitle}>{motor.modelo}</Text>
              {motor.tipo ? <Text style={styles.motorSubtitle}>{motor.tipo}</Text> : null}
            </View>
            <View style={styles.hpBadge}>
              <Text style={styles.hpBadgeText}>{motor.potencia}</Text>
            </View>
          </View>

          <View style={styles.specsContainer}>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>CILINDRADA</Text>
              <Text style={styles.specValue}>{motor.cilindrada || '-'}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>PESO SECO</Text>
              <Text style={styles.specValue}>{motor.peso_seco || '-'}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>SISTEMA</Text>
              <Text style={styles.specValue}>{motor.sistema || '-'}</Text>
            </View>
          </View>

          {motor.caracteristicas ? (
            <View style={styles.descriptionCard}>
              <Text style={styles.descLabel}>DESCRIPCIÓN</Text>
              <Text style={styles.descText}>{motor.caracteristicas}</Text>
            </View>
          ) : null}

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>PRECIO REF.</Text>
              <Text style={styles.priceValue}>${motor.precio.toLocaleString()} USD</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>ENTRADA</Text>
              <Text style={styles.priceValueSecondary}>
                ${motor.financiamiento_entrada.toLocaleString()}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>CUOTAS ({motor.financiamiento_cuotas} meses)</Text>
              <Text style={styles.priceQuota}>${cuotaMensual.toLocaleString()}/mes</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cotizarButton}
            onPress={() => setModalVisible(true)}
            testID="cotizar-detail-button"
          >
            <Ionicons name="call" size={22} color="#fff" />
            <Text style={styles.cotizarButtonText}>COTIZAR AHORA</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <ContactModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={`Cotización ${motor.modelo}`}
        phoneNumber={config?.whatsapp_ventas || ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F4',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  imageCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  motorImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#e0e0e0',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  imageBadgeText: {
    color: '#E63946',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  infoSection: {
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  motorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  motorSubtitle: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  hpBadge: {
    backgroundColor: '#FFE5E8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  hpBadgeText: {
    color: '#E63946',
    fontSize: 14,
    fontWeight: '800',
  },
  specsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    gap: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  specCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 22,
    fontWeight: '500',
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  priceLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  priceValueSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  priceQuota: {
    fontSize: 18,
    fontWeight: '800',
    color: '#27AE60',
  },
  cotizarButton: {
    backgroundColor: '#E63946',
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cotizarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  backLinkButton: {
    backgroundColor: '#E63946',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
