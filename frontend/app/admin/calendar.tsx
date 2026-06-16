import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getCalendar,
  createEvento,
  updateEvento,
  deleteEvento,
  CalendarioEvento,
} from '@/src/services/api';

const EMPTY_FORM = { titulo: '', fecha: '', hora: '', localidad: '', descripcion: '' };

export default function CalendarManagementScreen() {
  const router = useRouter();
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      const data = await getCalendar();
      setEventos(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalVisible(true);
  };

  const openEdit = (evento: CalendarioEvento) => {
    setForm({
      titulo: evento.titulo || '',
      fecha: evento.fecha,
      hora: evento.hora || '',
      localidad: evento.localidad,
      descripcion: evento.descripcion,
    });
    setEditingId(evento.id!);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.titulo || !form.fecha || !form.localidad) {
      Alert.alert('Error', 'Complete al menos: título, fecha y lugar');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateEvento(editingId, form);
      } else {
        await createEvento(form);
      }
      setModalVisible(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadEventos();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (evento: CalendarioEvento) => {
    Alert.alert('Confirmar', `¿Eliminar "${evento.titulo || evento.localidad}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvento(evento.id!);
            loadEventos();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const renderEvento = ({ item }: { item: CalendarioEvento }) => (
    <View style={styles.eventoCard} testID={`evento-${item.id}`}>
      <View style={styles.eventoIcon}>
        <Ionicons name="calendar" size={24} color="#0a1628" />
      </View>
      <View style={{ flex: 1 }}>
        {item.titulo ? <Text style={styles.eventoTitulo}>{item.titulo}</Text> : null}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color="#888" />
          <Text style={styles.metaText}>
            {item.fecha}
            {item.hora ? `  •  ${item.hora}` : ''}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color="#888" />
          <Text style={styles.metaText}>{item.localidad}</Text>
        </View>
        {item.descripcion ? (
          <Text style={styles.descripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openEdit(item)}
          testID={`edit-evento-${item.id}`}
        >
          <Ionicons name="create" size={18} color="#0a1628" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          testID={`delete-evento-${item.id}`}
        >
          <Ionicons name="trash" size={18} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="back-button">
          <Ionicons name="arrow-back" size={28} color="#0a1628" />
        </TouchableOpacity>
        <Text style={styles.title}>Campañas de Mantenimiento</Text>
        <TouchableOpacity onPress={openAdd} testID="add-evento-button">
          <Ionicons name="add-circle" size={32} color="#E63946" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : eventos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay campañas programadas</Text>
          <TouchableOpacity style={styles.addBtnLarge} onPress={openAdd}>
            <Text style={styles.addBtnLargeText}>Agregar primera campaña</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={eventos}
          renderItem={renderEvento}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Editar Campaña' : 'Nueva Campaña'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#0a1628" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Título del evento *</Text>
                <TextInput
                  style={styles.input}
                  value={form.titulo}
                  onChangeText={(t) => setForm({ ...form, titulo: t })}
                  placeholder="Ej: Jornada de mantenimiento gratuito"
                  testID="input-titulo"
                />
              </View>

              <View style={styles.rowFields}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Fecha *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.fecha}
                    onChangeText={(t) => setForm({ ...form, fecha: t })}
                    placeholder="2026-08-15"
                    testID="input-fecha"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Hora</Text>
                  <TextInput
                    style={styles.input}
                    value={form.hora}
                    onChangeText={(t) => setForm({ ...form, hora: t })}
                    placeholder="09:00"
                    testID="input-hora"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lugar *</Text>
                <TextInput
                  style={styles.input}
                  value={form.localidad}
                  onChangeText={(t) => setForm({ ...form, localidad: t })}
                  placeholder="Ej: Guayaquil - Puerto Marítimo"
                  testID="input-lugar"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={form.descripcion}
                  onChangeText={(t) => setForm({ ...form, descripcion: t })}
                  placeholder="Detalles del evento, servicios incluidos, etc."
                  multiline
                  numberOfLines={3}
                  testID="input-descripcion"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
                testID="save-evento-button"
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={22} color="#fff" />
                    <Text style={styles.saveButtonText}>
                      {editingId ? 'Guardar Cambios' : 'Crear Campaña'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  title: { fontSize: 16, fontWeight: '800', color: '#0a1628' },
  list: { padding: 16 },
  eventoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventoTitulo: { fontSize: 14, fontWeight: '800', color: '#0a1628', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metaText: { fontSize: 11, color: '#888', fontWeight: '500' },
  descripcion: { fontSize: 11, color: '#666', marginTop: 4 },
  actions: { gap: 6 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffe6e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 16, marginBottom: 24 },
  addBtnLarge: {
    backgroundColor: '#E63946',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  addBtnLargeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0a1628' },
  inputGroup: { marginBottom: 16 },
  rowFields: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 13, fontWeight: '700', color: '#0a1628', marginBottom: 6 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#E63946',
    borderRadius: 26,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
});
