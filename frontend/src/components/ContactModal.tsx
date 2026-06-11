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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  phoneNumber: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ visible, onClose, title, phoneNumber }) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [localidad, setLocalidad] = useState('');

  const handleSubmit = () => {
    if (!nombre || !telefono || !localidad) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    const message = `Hola! Solicito ${title}\n\nNombre: ${nombre}\nTeléfono: ${telefono}\nLocalidad: ${localidad}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
    });

    // Clear form and close
    setNombre('');
    setTelefono('');
    setLocalidad('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.form}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ingrese su nombre"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder="Ingrese su teléfono"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Localidad</Text>
                <TextInput
                  style={styles.input}
                  value={localidad}
                  onChangeText={setLocalidad}
                  placeholder="Ingrese su localidad"
                  placeholderTextColor="#999"
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                  <Text style={styles.submitButtonText}>Enviar por WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ContactModal;
