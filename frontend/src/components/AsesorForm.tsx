import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PROVINCIAS, Asesor } from '@/src/services/api';

interface AsesorFormProps {
  initialValue?: Partial<Asesor>;
  onSubmit: (data: Omit<Asesor, 'id'>) => Promise<void>;
  submitLabel?: string;
}

const AsesorForm: React.FC<AsesorFormProps> = ({
  initialValue,
  onSubmit,
  submitLabel = 'Guardar',
}) => {
  const [nombre, setNombre] = useState(initialValue?.nombre || '');
  const [whatsapp, setWhatsapp] = useState(initialValue?.whatsapp || '');
  const [provincia, setProvincia] = useState(initialValue?.provincia || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nombre.trim() || !whatsapp.trim() || !provincia) {
      Alert.alert('Campos requeridos', 'Por favor completa Nombre, WhatsApp y Provincia.');
      return;
    }
    const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      Alert.alert('WhatsApp inválido', 'Ingresa un número de WhatsApp válido (incluye código de país, ej: 5939...).');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ nombre: nombre.trim(), whatsapp: cleanPhone, provincia });
    } catch (e) {
      // El error se muestra en el screen contenedor
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>NOMBRE DEL ASESOR</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Juan Pérez"
          placeholderTextColor="#999"
          autoCapitalize="words"
          testID="asesor-nombre-input"
        />

        <Text style={styles.label}>WHATSAPP (con código de país)</Text>
        <TextInput
          style={styles.input}
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="Ej. 593991234567"
          keyboardType="phone-pad"
          placeholderTextColor="#999"
          testID="asesor-whatsapp-input"
        />
        <Text style={styles.helper}>
          Incluye el código de país sin signos (+). Ej: 593 para Ecuador.
        </Text>

        <Text style={styles.label}>PROVINCIA ASIGNADA</Text>
        <View style={styles.provinciasGrid}>
          {PROVINCIAS.map((prov) => {
            const selected = provincia === prov;
            return (
              <TouchableOpacity
                key={prov}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setProvincia(prov)}
                testID={`asesor-provincia-${prov}`}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {prov}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          testID="asesor-submit-button"
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.submitText}>{submitLabel}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A1F44',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e6e8eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  helper: { fontSize: 11, color: '#888', marginTop: 6, marginLeft: 4 },
  provinciasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e6e8eb',
  },
  chipSelected: {
    backgroundColor: '#FFE5E8',
    borderColor: '#E63946',
  },
  chipText: { fontSize: 12, color: '#555', fontWeight: '600' },
  chipTextSelected: { color: '#E63946', fontWeight: '800' },
  submitBtn: {
    backgroundColor: '#0A1F44',
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default AsesorForm;
