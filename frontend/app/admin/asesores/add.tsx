import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsesorForm from '@/src/components/AsesorForm';
import { createAsesor, Asesor } from '@/src/services/api';

export default function AddAsesorScreen() {
  const router = useRouter();

  const handleSubmit = async (data: Omit<Asesor, 'id'>) => {
    try {
      await createAsesor(data);
      Alert.alert('Éxito', 'Asesor creado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.detail || 'No se pudo crear el asesor');
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Ionicons name="arrow-back" size={28} color="#0A1F44" />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Asesor</Text>
        <View style={{ width: 28 }} />
      </View>
      <AsesorForm onSubmit={handleSubmit} submitLabel="CREAR ASESOR" />
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
});
