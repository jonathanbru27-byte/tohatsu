import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createMotor, updateMotor, getMotor } from '@/src/services/api';

interface MotorFormProps {
  mode: 'add' | 'edit';
}

export default function MotorForm({ mode }: MotorFormProps) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [form, setForm] = useState({
    modelo: '',
    potencia: '',
    hp_value: '',
    tipo: '',
    cilindrada: '',
    peso_seco: '',
    sistema: '',
    badge_text: 'JAPAN TECH',
    caracteristicas: '',
    precio: '',
    imagen: '',
    financiamiento_entrada: '',
    financiamiento_cuotas: '30',
  });

  useEffect(() => {
    if (mode === 'edit' && id) loadMotor();
  }, [id, mode]);

  const loadMotor = async () => {
    try {
      const motor = await getMotor(id!);
      setForm({
        modelo: motor.modelo,
        potencia: motor.potencia,
        hp_value: (motor.hp_value || 0).toString(),
        tipo: motor.tipo || '',
        cilindrada: motor.cilindrada || '',
        peso_seco: motor.peso_seco || '',
        sistema: motor.sistema || '',
        badge_text: motor.badge_text || 'JAPAN TECH',
        caracteristicas: motor.caracteristicas || '',
        precio: motor.precio.toString(),
        imagen: motor.imagen,
        financiamiento_entrada: motor.financiamiento_entrada.toString(),
        financiamiento_cuotas: motor.financiamiento_cuotas.toString(),
      });
    } catch {
      Alert.alert('Error', 'No se pudo cargar el motor');
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // On web, permissions are not required - browser handles it
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para subir una imagen');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Web: usa el URI directo (ya viene como data URL). Nativo: usa base64
        if (Platform.OS === 'web' && asset.uri && asset.uri.startsWith('data:')) {
          setForm({ ...form, imagen: asset.uri });
        } else if (asset.base64) {
          setForm({ ...form, imagen: `data:image/jpeg;base64,${asset.base64}` });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSave = async () => {
    if (!form.modelo || !form.potencia || !form.precio || !form.imagen) {
      Alert.alert('Error', 'Complete: Modelo, Potencia, Precio e Imagen');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        modelo: form.modelo,
        potencia: form.potencia,
        hp_value: parseInt(form.hp_value) || 0,
        tipo: form.tipo,
        cilindrada: form.cilindrada,
        peso_seco: form.peso_seco,
        sistema: form.sistema,
        badge_text: form.badge_text || 'JAPAN TECH',
        caracteristicas: form.caracteristicas,
        precio: parseFloat(form.precio),
        imagen: form.imagen,
        financiamiento_entrada: parseFloat(form.financiamiento_entrada) || 0,
        financiamiento_cuotas: parseInt(form.financiamiento_cuotas) || 30,
      };
      if (mode === 'edit' && id) {
        await updateMotor(id, payload);
        Alert.alert('Éxito', 'Motor actualizado', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        await createMotor(payload);
        Alert.alert('Éxito', 'Motor agregado', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch {
      Alert.alert('Error', 'No se pudo guardar el motor');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Ionicons name="arrow-back" size={28} color="#0A1F44" />
        </TouchableOpacity>
        <Text style={styles.title}>{mode === 'edit' ? 'Editar Motor' : 'Agregar Motor'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.imageSelector} onPress={pickImage} testID="pick-motor-image">
            {form.imagen ? (
              <Image source={{ uri: form.imagen }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={48} color="#0A1F44" />
                <Text style={styles.imagePlaceholderText}>Tocar para subir imagen</Text>
              </View>
            )}
            {form.imagen ? (
              <View style={styles.changeImageBadge}>
                <Ionicons name="camera-reverse" size={16} color="#fff" />
                <Text style={styles.changeImageText}>Cambiar</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modelo *</Text>
              <TextInput
                style={styles.input}
                value={form.modelo}
                onChangeText={(t) => setForm({ ...form, modelo: t })}
                placeholder="Ej: Tohatsu MFS140A"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Potencia *</Text>
              <TextInput
                style={styles.input}
                value={form.potencia}
                onChangeText={(t) => setForm({ ...form, potencia: t })}
                placeholder="Ej: 148 HP"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>HP (número) *</Text>
              <TextInput
                style={styles.input}
                value={form.hp_value}
                onChangeText={(t) => setForm({ ...form, hp_value: t })}
                placeholder="Ej: 148"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo</Text>
              <TextInput
                style={styles.input}
                value={form.tipo}
                onChangeText={(t) => setForm({ ...form, tipo: t })}
                placeholder="Ej: 4 Tiempos - Inyección Electrónica"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cilindrada</Text>
              <TextInput
                style={styles.input}
                value={form.cilindrada}
                onChangeText={(t) => setForm({ ...form, cilindrada: t })}
                placeholder="Ej: 1995 cc"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso seco</Text>
              <TextInput
                style={styles.input}
                value={form.peso_seco}
                onChangeText={(t) => setForm({ ...form, peso_seco: t })}
                placeholder="Ej: 186 kg"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sistema</Text>
              <TextInput
                style={styles.input}
                value={form.sistema}
                onChangeText={(t) => setForm({ ...form, sistema: t })}
                placeholder="Ej: EFI"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Texto del Badge</Text>
              <TextInput
                style={styles.input}
                value={form.badge_text}
                onChangeText={(t) => setForm({ ...form, badge_text: t })}
                placeholder="Ej: JAPAN TECH"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Características</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.caracteristicas}
                onChangeText={(t) => setForm({ ...form, caracteristicas: t })}
                placeholder="Descripción detallada del motor"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Precio (USD) *</Text>
              <TextInput
                style={styles.input}
                value={form.precio}
                onChangeText={(t) => setForm({ ...form, precio: t })}
                placeholder="Ej: 14998"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Entrada (financiamiento)</Text>
              <TextInput
                style={styles.input}
                value={form.financiamiento_entrada}
                onChangeText={(t) => setForm({ ...form, financiamiento_entrada: t })}
                placeholder="Ej: 2998"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cuotas máximas</Text>
              <TextInput
                style={styles.input}
                value={form.financiamiento_cuotas}
                onChangeText={(t) => setForm({ ...form, financiamiento_cuotas: t })}
                placeholder="Ej: 30"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
              testID="save-motor-button"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={22} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {mode === 'edit' ? 'Guardar Cambios' : 'Crear Motor'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  content: { padding: 16 },
  imageSelector: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A1F44',
    borderStyle: 'dashed',
    borderRadius: 14,
  },
  imagePlaceholderText: { fontSize: 14, color: '#0A1F44', marginTop: 8, fontWeight: '600' },
  changeImageBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(10, 31, 68, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeImageText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '700', color: '#0A1F44' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#E63946',
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
