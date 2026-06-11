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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMotor, Motor } from '@/src/services/api';

export default function MotorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [motor, setMotor] = useState<Motor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMotor();
  }, [id]);

  const loadMotor = async () => {
    try {
      if (!id) return;
      const data = await getMotor(id);
      setMotor(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el motor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!motor) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Motor no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const calcularCuotaMensual = () => {
    const montoFinanciado = motor.precio - motor.financiamiento_entrada;
    return montoFinanciado / motor.financiamiento_cuotas;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <ScrollView>
        <Image source={{ uri: motor.imagen }} style={styles.motorImage} resizeMode="cover" />

        <View style={styles.content}>
          <Text style={styles.modelo}>{motor.modelo}</Text>
          <Text style={styles.potencia}>{motor.potencia}</Text>

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Precio</Text>
            <Text style={styles.price}>${motor.precio.toLocaleString()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>
            <Text style={styles.caracteristicas}>{motor.caracteristicas}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financiamiento</Text>
            <View style={styles.financingCard}>
              <View style={styles.financingRow}>
                <Ionicons name="cash-outline" size={24} color="#0066cc" />
                <View style={styles.financingInfo}>
                  <Text style={styles.financingLabel}>Entrada</Text>
                  <Text style={styles.financingValue}>
                    ${motor.financiamiento_entrada.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.financingRow}>
                <Ionicons name="calendar-outline" size={24} color="#0066cc" />
                <View style={styles.financingInfo}>
                  <Text style={styles.financingLabel}>Cuotas mensuales</Text>
                  <Text style={styles.financingValue}>
                    {motor.financiamiento_cuotas} x ${calcularCuotaMensual().toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.financingRow}>
                <Ionicons name="calculator-outline" size={24} color="#0066cc" />
                <View style={styles.financingInfo}>
                  <Text style={styles.financingLabel}>Total financiado</Text>
                  <Text style={styles.financingValue}>
                    ${(motor.precio - motor.financiamiento_entrada).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push('/client/contact')}
          >
            <Ionicons name="chatbubbles" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>Contactar ahora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motorImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  modelo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  potencia: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  priceCard: {
    backgroundColor: '#0066cc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  caracteristicas: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  financingCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  financingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  financingInfo: {
    flex: 1,
  },
  financingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  financingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  contactButton: {
    backgroundColor: '#0066cc',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
  },
});
