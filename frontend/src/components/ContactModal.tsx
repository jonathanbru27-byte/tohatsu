import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  PROVINCIAS,
  createLead,
  getAsesorByProvincia,
} from '@/src/services/api';

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Fallback WhatsApp si no hay asesor para la provincia */
  phoneNumber: string;
  /** Tipo de interés a registrar: motor / repuesto / servicio */
  interes: 'motor' | 'repuesto' | 'servicio';
  /** Mensaje predeterminado / detalle a registrar */
  detalle?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({
  visible,
  onClose,
  title,
  phoneNumber,
  interes,
  detalle = '',
}) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [provincia, setProvincia] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setNombre('');
    setTelefono('');
    setProvincia('');
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!nombre.trim() || !telefono.trim() || !provincia) {
      Alert.alert('Campos requeridos', 'Por favor completa Nombre, Teléfono y selecciona tu Provincia.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Registrar el lead (no bloquea si falla)
      try {
        await createLead({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          provincia,
          interes,
          detalle,
        });
      } catch (e) {
        // Permitir continuar con WhatsApp aunque falle el registro
      }

      // 2. Obtener asesor por provincia (fallback al número general)
      let asesorWhatsapp = phoneNumber;
      let asesorNombre = '';
      try {
        const asesor = await getAsesorByProvincia(provincia);
        if (asesor?.whatsapp) {
          asesorWhatsapp = asesor.whatsapp;
          asesorNombre = asesor.nombre || '';
        }
      } catch (e) {
        // usar phoneNumber por defecto
      }

      // 3. Construir mensaje WhatsApp
      const saludo = asesorNombre ? `Hola ${asesorNombre}!` : 'Hola!';
      const detalleLinea = detalle ? `\n${detalle}` : '';
      const message =
        `${saludo} Solicito información sobre: ${title}${detalleLinea}\n\n` +
        `Nombre: ${nombre.trim()}\n` +
        `Teléfono: ${telefono.trim()}\n` +
        `Provincia: ${provincia}`;

      const cleanPhone = (asesorWhatsapp || '').replace(/[^0-9]/g, '');
      if (!cleanPhone) {
        Alert.alert('Sin asesor disponible', 'En este momento no hay un asesor disponible. Inténtalo más tarde.');
        setSubmitting(false);
        return;
      }
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      const can = await Linking.canOpenURL(whatsappUrl).catch(() => true);
      if (!can) {
        Alert.alert('Error', 'No se pudo abrir WhatsApp. Verifica que esté instalado.');
        setSubmitting(false);
        return;
      }

      await Linking.openURL(whatsappUrl);
      reset();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al enviar tu solicitud.');
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.subtitle}>Te conectaremos con el asesor de tu zona</Text>
              </View>
              <TouchableOpacity onPress={handleClose} testID="modal-close-button" hitSlop={10}>
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View style={styles.form}>
                <Text style={styles.label}>NOMBRE</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Tu nombre completo"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  testID="modal-nombre-input"
                />

                <Text style={styles.label}>TELÉFONO</Text>
                <TextInput
                  style={styles.input}
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder="Ej. 0991234567"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                  testID="modal-telefono-input"
                />

                <Text style={styles.label}>PROVINCIA</Text>
                <View style={styles.provinciasGrid}>
                  {PROVINCIAS.map((prov) => {
                    const selected = provincia === prov;
                    return (
                      <TouchableOpacity
                        key={prov}
                        style={[styles.chip, selected && styles.chipSelected]}
                        onPress={() => setProvincia(prov)}
                        testID={`provincia-${prov}`}
                      >
                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                          {prov}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  testID="modal-submit-button"
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="logo-whatsapp" size={22} color="#fff" />
                      <Text style={styles.submitButtonText}>ENVIAR POR WHATSAPP</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.privacyNote}>
                  Tus datos se usarán únicamente para contactarte sobre tu solicitud.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontWeight: '500',
  },
  form: { gap: 6 },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A1F44',
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e6e8eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    backgroundColor: '#f7f8fa',
    color: '#1a1a1a',
  },
  provinciasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    borderWidth: 1.5,
    borderColor: '#f0f2f5',
  },
  chipSelected: {
    backgroundColor: '#FFE5E8',
    borderColor: '#E63946',
  },
  chipText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#E63946',
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: '#25D366',
    borderRadius: 30,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  privacyNote: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
    lineHeight: 16,
  },
});

export default ContactModal;
