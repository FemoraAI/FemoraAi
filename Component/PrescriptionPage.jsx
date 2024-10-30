import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRESCRIPTIONS = [
  {
    id: 1,
    doctorName: 'Dr. Sarah Williams',
    specialty: 'Gynaecologist',
    date: 'October 28, 2024',
    prescriptionNumber: 'RX2024102801',
    status: 'New',
    medications: [
      {
        name: 'Prenatal Vitamins',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        quantity: 30,
        price: 24.99,
        inStock: true
      },
      {
        name: 'Folic Acid 5mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        quantity: 60,
        price: 15.99,
        inStock: true
      }
    ],
    notes: 'Take with food in the morning',
    image: 'https://via.placeholder.com/60x60.png?text=SW'
  },
  {
    id: 2,
    doctorName: 'Dr. Emily Rodriguez',
    specialty: 'Gynaecologist',
    date: 'October 15, 2024',
    prescriptionNumber: 'RX2024101502',
    status: 'Ordered',
    medications: [
      {
        name: 'Iron Supplement',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '60 days',
        quantity: 60,
        price: 19.99,
        inStock: true
      }
    ],
    notes: 'Take on empty stomach',
    image: 'https://via.placeholder.com/60x60.png?text=ER'
  },
  {
    id: 3,
    doctorName: 'Dr. Sarah Williams',
    specialty: 'Gynaecologist',
    date: 'September 30, 2024',
    prescriptionNumber: 'RX2024093003',
    status: 'Delivered',
    medications: [
      {
        name: 'Calcium + Vitamin D3',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        quantity: 60,
        price: 29.99,
        inStock: false
      }
    ],
    notes: 'Take after meals',
    image: 'https://via.placeholder.com/60x60.png?text=SW'
  }
];

const PrescriptionCard = ({ prescription, onOrder }) => {
    
    const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const [selectedMeds, setSelectedMeds] = useState({});

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return { bg: '#E8F5E9', text: '#4CAF50', icon: 'document-text' };
      case 'Ordered':
        return { bg: '#FFF3E0', text: '#FF9800', icon: 'cart' };
      case 'Delivered':
        return { bg: '#E3F2FD', text: '#2196F3', icon: 'checkbox' };
      default:
        return { bg: '#E8F5E9', text: '#4CAF50', icon: 'document-text' };
    }
  };

  const statusStyle = getStatusColor(prescription.status);
  const totalAmount = Object.keys(selectedMeds).reduce((sum, medIndex) => {
    if (selectedMeds[medIndex]) {
      return sum + prescription.medications[medIndex].price;
    }
    return sum;
  }, 0);

  const toggleMedication = (index) => {
    setSelectedMeds(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleOrder = () => {
    const orderedMeds = prescription.medications.filter((_, index) => selectedMeds[index]);
    onOrder(prescription.id, orderedMeds, totalAmount);
  };

  return (
    <View style={styles.prescriptionCard}>
      {/* Header Section */}
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <Image
          source={{ uri: prescription.image }}
          style={styles.doctorImage}
        />
        <View style={styles.prescriptionInfo}>
          <Text style={styles.doctorName}>{prescription.doctorName}</Text>
          <Text style={styles.doctorSpecialty}>{prescription.specialty}</Text>
          <Text style={styles.prescriptionDate}>
            <Ionicons name="calendar-outline" size={14} color="#8F90A6" /> {prescription.date}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Ionicons name={statusStyle.icon} size={16} color={statusStyle.text} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{prescription.status}</Text>
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.prescriptionDetails}>
            <Text style={styles.prescriptionNumber}>
              Prescription #{prescription.prescriptionNumber}
            </Text>
            <Text style={styles.prescriptionNotes}>{prescription.notes}</Text>
          </View>

          {/* Medications List */}
          <View style={styles.medicationsList}>
            <Text style={styles.medicationsTitle}>Prescribed Medications</Text>
            {prescription.medications.map((medication, index) => (
              <View key={index} style={styles.medicationItem}>
                {prescription.status === 'New' && (
                  <TouchableOpacity 
                    style={styles.checkbox}
                    onPress={() => toggleMedication(index)}
                  >
                    <Ionicons 
                      name={selectedMeds[index] ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={selectedMeds[index] ? "#E91E63" : "#8F90A6"} 
                    />
                  </TouchableOpacity>
                )}
                <View style={styles.medicationDetails}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>
                    {medication.dosage} • {medication.frequency}
                  </Text>
                  <Text style={styles.medicationDuration}>
                    Duration: {medication.duration} • Quantity: {medication.quantity}
                  </Text>
                  <View style={styles.medicationPriceRow}>
                    <Text style={styles.medicationPrice}>${medication.price.toFixed(2)}</Text>
                    {!medication.inStock && (
                      <Text style={styles.outOfStock}>Out of Stock</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Order Section */}
          {prescription.status === 'New' && (
            <View style={styles.orderSection}>
              <View style={styles.totalAmount}>
                <Text style={styles.totalText}>Total Amount:</Text>
                <Text style={styles.totalPrice}>${totalAmount.toFixed(2)}</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.orderButton,
                  (!Object.values(selectedMeds).some(Boolean) && styles.disabledButton)
                ]}
                onPress={handleOrder}
                disabled={!Object.values(selectedMeds).some(Boolean)}
              >
                <Text style={styles.orderButtonText}>Order Medicines</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const PrescriptionPage = ({ navigation }) => {
  const [prescriptions, setPrescriptions] = useState(PRESCRIPTIONS);

  const handleOrder = (prescriptionId, medications, totalAmount) => {
    // Handle order logic here
    setPrescriptions(prev => 
      prev.map(prescription => 
        prescription.id === prescriptionId 
          ? { ...prescription, status: 'Ordered' }
          : prescription
      )
    );
    // You would typically make an API call here to process the order
    alert(`Order placed successfully!\nTotal Amount: $${totalAmount.toFixed(2)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#E91E63" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Prescriptions</Text>
        <View style={styles.backButton} />
      </View>

      {/* Prescriptions List */}
      <ScrollView style={styles.prescriptionsList}>
        {prescriptions.map(prescription => (
          <PrescriptionCard 
            key={prescription.id}
            prescription={prescription}
            onOrder={handleOrder}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4EC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D3A',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  prescriptionsList: {
    flex: 1,
    padding: 20,
  },
  prescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  prescriptionInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D3A',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#8F90A6',
    marginBottom: 4,
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#8F90A6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#FFE4EC',
    padding: 20,
  },
  prescriptionDetails: {
    marginBottom: 16,
  },
  prescriptionNumber: {
    fontSize: 14,
    color: '#8F90A6',
    marginBottom: 8,
  },
  prescriptionNotes: {
    fontSize: 14,
    color: '#2D2D3A',
    fontStyle: 'italic',
  },
  medicationsList: {
    marginBottom: 16,
  },
  medicationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 12,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4EC',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#8F90A6',
    marginBottom: 4,
  },
  medicationDuration: {
    fontSize: 14,
    color: '#8F90A6',
    marginBottom: 4,
  },
  medicationPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicationPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
  },
  outOfStock: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  orderSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFE4EC',
  },
  totalAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D3A',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E91E63',
  },
  orderButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  disabledButton: {
    backgroundColor: '#FFB6C1',
  },
});

export default PrescriptionPage;