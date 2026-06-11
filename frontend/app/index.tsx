import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMotors, Motor } from '@/src/services/api';
import CustomTabBar from '@/src/components/CustomTabBar';

export default function HomeScreen() {
  const router = useRouter();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMotors();
  }, []);

  const loadMotors = async () => {
    try {
      const data = await getMotors();
      setMotors(data.slice(0, 3));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.brandText}>TOHATSU</Text>
          </View>
          <View style={styles.logoBadge}>
            <Ionicons name="boat" size={28} color="#E63946" />
          </View>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>MOTORES FUERA DE BORDA</Text>
            <Text style={styles.heroTitle}>Calidad Japonesa</Text>
            <Text style={styles.heroDescription}>
              Más de 60 años de innovación marina al servicio de tu navegación
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.push('/client')}
              testID="hero-explore-button"
            >
              <Text style={styles.heroButtonText}>EXPLORAR CATÁLOGO</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionTitle}>
          <View style={styles.sectionTitleBar} />
          <Text style={styles.sectionTitleText}>ACCIONES RÁPIDAS</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/client')}
            testID="action-motors"
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFE5E8' }]}>
              <Ionicons name="boat" size={28} color="#E63946" />
            </View>
            <Text style={styles.actionText}>Ver Motores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/client/contact')}
            testID="action-contact"
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="call" size={28} color="#E67E22" />
            </View>
            <Text style={styles.actionText}>Contactar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/client/calendar')}
            testID="action-calendar"
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="calendar" size={28} color="#27AE60" />
            </View>
            <Text style={styles.actionText}>Calendario</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Motors */}
        <View style={styles.sectionTitle}>
          <View style={styles.sectionTitleBar} />
          <Text style={styles.sectionTitleText}>MODELOS DESTACADOS</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#E63946" style={{ marginVertical: 40 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {motors.map((motor) => (
              <TouchableOpacity
                key={motor.id}
                style={styles.featuredCard}
                onPress={() => router.push(`/client/motor/${motor.id}` as any)}
                testID={`featured-${motor.id}`}
              >
                <Image source={{ uri: motor.imagen }} style={styles.featuredImage} resizeMode="cover" />
                <View style={styles.featuredHpBadge}>
                  <Text style={styles.featuredHpText}>{motor.potencia}</Text>
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredTitle} numberOfLines={1}>{motor.modelo}</Text>
                  <Text style={styles.featuredPrice}>${motor.precio.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <CustomTabBar />
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
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  brandText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFE5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    minHeight: 200,
  },
  heroOverlay: {
    padding: 24,
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#E63946',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: '#E63946',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleBar: {
    width: 24,
    height: 3,
    backgroundColor: '#E63946',
    borderRadius: 2,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 1.5,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  featuredContainer: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 8,
  },
  featuredCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
  },
  featuredHpBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E63946',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredHpText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  featuredInfo: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E63946',
  },
});
