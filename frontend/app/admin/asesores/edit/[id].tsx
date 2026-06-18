import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsesorForm from '@/src/components/AsesorForm';
import { getAsesores, updateAsesor, Asesor } from '@/src/services/api';

export default function EditAsesorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [asesor, setAsesor] = useState<Asesor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAsesor();
  }, [id]);

  const loadAsesor = async () => {
    try {
      const all = await getAsesores();
      const found = all.find((a) => a.id === id);
      if (!found) {
        Alert.alert('Error', 'Asesor no encontrado', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }
      setAsesor(found);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el asesor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<Asesor, 'id'>) => {
    if (!id) return;
    try {
      await updateAsesor(id, data);
      Alert.alert('Éxito', 'Asesor actualizado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.detail || 'No se pudo actualizar');
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Ionicons name="arrow-back" size={28} color="#0A1F44" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Asesor</Text>
        <View style={{ width: 28 }} />
      </View>
      {loading || !asesor ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : (
        <AsesorForm initialValue={asesor} onSubmit={handleSubmit} submitLabel="GUARDAR CAMBIOS" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#0A1F44' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
