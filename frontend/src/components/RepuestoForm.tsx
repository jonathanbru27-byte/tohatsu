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
import { createRepuesto, updateRepuesto, getRepuestos, Repuesto } from '@/src/services/api';

const CATEGORIAS = [
  'Filtros', 'Encendido', 'Refrigeración', 'Lubricantes',
  'Hélices', 'Protección', 'Combustible', 'Mandos', 'General',
];

interface RepuestoFormProps {
  mode: 'add' | 'edit';
}

export default function RepuestoForm({ mode }: RepuestoFormProps) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categoria: 'General',
    stock: '0',
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadRepuesto();
    }
  }, [id, mode]);

  const loadRepuesto = async () => {
    try {
      const all = await getRepuestos();
      const found = all.find((r) => r.id === id);
      if (found) {
        setForm({
          nombre: found.nombre,
          descripcion: found.descripcion,
          precio: found.precio.toString(),
          imagen: found.imagen || '',
          categoria: found.categoria || 'General',
          stock: (found.stock || 0).toString(),
        });
      }
    } catch {
      Alert.alert('Error', 'No se pudo cargar el repuesto');
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesita acceso a tus fotos');
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (Platform.OS === 'web' && asset.uri && asset.uri.startsWith('data:')) {
          setForm({ ...form, imagen: asset.uri });
        } else if (asset.base64) {
          setForm({ ...form, imagen: `data:image/jpeg;base64,${asset.base64}` });
        }
      }
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSave = async () => {
    if (!form.nombre || !form.descripcion || !form.precio) {
      Alert.alert('Error', 'Complete nombre, descripción y precio');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        imagen: form.imagen,
        categoria: form.categoria,
        stock: parseInt(form.stock) || 0,
      };
      if (mode === 'edit' && id) {
        await updateRepuesto(id, payload);
        Alert.alert('Éxito', 'Repuesto actualizado', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await createRepuesto(payload);
        Alert.alert('Éxito', 'Repuesto agregado', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch {
      Alert.alert('Error', 'No se pudo guardar');
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
        <Text style={styles.title}>
          {mode === 'edit' ? 'Editar Repuesto' : 'Agregar Repuesto'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image picker */}
          <TouchableOpacity style={styles.imageSelector} onPress={pickImage} testID="pick-image">
            {form.imagen ? (
              <Image source={{ uri: form.imagen }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={48} color="#0A1F44" />
                <Text style={styles.imagePlaceholderText}>Tocar para subir imagen</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del repuesto *</Text>
              <TextInput
                style={styles.input}
                value={form.nombre}
                onChangeText={(text) => setForm({ ...form, nombre: text })}
                placeholder="Ej: Filtro de aceite OEM"
                testID="input-nombre"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.descripcion}
                onChangeText={(text) => setForm({ ...form, descripcion: text })}
                placeholder="Describe el repuesto, compatibilidades, etc."
                multiline
                numberOfLines={4}
                testID="input-descripcion"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Precio (USD) *</Text>
              <TextInput
                style={styles.input}
                value={form.precio}
                onChangeText={(text) => setForm({ ...form, precio: text })}
                placeholder="Ej: 28.50"
                keyboardType="numeric"
                testID="input-precio"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriasRow}
              >
                {CATEGORIAS.map((cat) => {
                  const selected = form.categoria === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catChip, selected && styles.catChipSelected]}
                      onPress={() => setForm({ ...form, categoria: cat })}
                      testID={`cat-${cat}`}
                    >
                      <Text style={[styles.catChipText, selected && styles.catChipTextSelected]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stock disponible</Text>
              <TextInput
                style={styles.input}
                value={form.stock}
                onChangeText={(text) => setForm({ ...form, stock: text })}
                placeholder="Ej: 25"
                keyboardType="numeric"
                testID="input-stock"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
              testID="save-button"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={22} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {mode === 'edit' ? 'Guardar Cambios' : 'Crear Repuesto'}
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
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
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
  categoriasRow: { gap: 8, paddingVertical: 4 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  catChipSelected: {
    backgroundColor: '#0A1F44',
    borderColor: '#0A1F44',
  },
  catChipText: { fontSize: 12, fontWeight: '700', color: '#666' },
  catChipTextSelected: { color: '#fff' },
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
