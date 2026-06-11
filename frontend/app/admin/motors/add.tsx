import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createMotor } from '@/src/services/api';

export default function AddMotorScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    modelo: '',
    potencia: '',
    caracteristicas: '',
    precio: '',
    imagen: '',
    financiamiento_entrada: '',
    financiamiento_cuotas: '30',
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesita permiso para acceder a las fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setForm({ ...form, imagen: `data:image/jpeg;base64,${result.assets[0].base64}` });
    }
  };

  const handleSave = async () => {
    if (!form.modelo || !form.potencia || !form.precio || !form.imagen) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await createMotor({
        modelo: form.modelo,
        potencia: form.potencia,
        caracteristicas: form.caracteristicas,
        precio: parseFloat(form.precio),
        imagen: form.imagen,
        financiamiento_entrada: parseFloat(form.financiamiento_entrada) || 0,
        financiamiento_cuotas: parseInt(form.financiamiento_cuotas) || 30,
      });
      Alert.alert('Éxito', 'Motor agregado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el motor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0066cc" />
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Motor</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
            {form.imagen ? (
              <Image source={{ uri: form.imagen }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={48} color="#999" />
                <Text style={styles.imagePlaceholderText}>Seleccionar imagen</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modelo *</Text>
              <TextInput
                style={styles.input}
                value={form.modelo}
                onChangeText={(text) => setForm({ ...form, modelo: text })}
                placeholder="Ej: Tohatsu 40 HP"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Potencia *</Text>
              <TextInput
                style={styles.input}
                value={form.potencia}
                onChangeText={(text) => setForm({ ...form, potencia: text })}
                placeholder="Ej: 40 HP"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Características</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.caracteristicas}
                onChangeText={(text) => setForm({ ...form, caracteristicas: text })}
                placeholder="Describe las características del motor"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Precio *</Text>
              <TextInput
                style={styles.input}
                value={form.precio}
                onChangeText={(text) => setForm({ ...form, precio: text })}
                placeholder="Ej: 5000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Entrada (financiamiento)</Text>
              <TextInput
                style={styles.input}
                value={form.financiamiento_entrada}
                onChangeText={(text) => setForm({ ...form, financiamiento_entrada: text })}
                placeholder="Ej: 1000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cuotas máximas</Text>
              <TextInput
                style={styles.input}
                value={form.financiamiento_cuotas}
                onChangeText={(text) => setForm({ ...form, financiamiento_cuotas: text })}
                placeholder="Ej: 30"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={24} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar Motor</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  imageSelector: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
