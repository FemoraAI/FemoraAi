import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from './context/UserContext';
import moment from 'moment';

const ProfileManagementScreen = ({ navigation }) => {
  const { userData, updateUserData } = useUser();
  const [localUserData, setLocalUserData] = useState({
    ...userData,
    lastPeriodStart: userData.lastPeriodStart || moment().format('YYYY-MM-DD'),
    periodDays: userData.periodDays || '',
    cycleDays: userData.cycleLength || ''
  });
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      updateUserData(localUserData);
    });

    return unsubscribe;
  }, [navigation, localUserData, updateUserData]);

  const handleInputChange = (field, value) => {
    setLocalUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEdit = (field) => {
    setEditingField(editingField === field ? null : field);
  };

  const renderDetailItem = (label, value, field) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      {editingField === field ? (
        <TextInput
          style={styles.editInput}
          value={String(value)}
          onChangeText={(text) => handleInputChange(field, text)}
          onBlur={() => toggleEdit(null)}
          autoFocus
          keyboardType={field === 'periodDays' || field === 'cycleDays' ? 'numeric' : 'default'}
        />
      ) : (
        <View style={styles.valueContainer}>
          <Text style={styles.detailValue}>
            {field === 'periodDays' || field === 'cycleDays' ? `${value} days` : value}
          </Text>
          <TouchableOpacity onPress={() => toggleEdit(field)}>
            <MaterialIcons name="edit" size={20} color="#E91E63" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderDate}>{item.date}</Text>
      <Text style={styles.orderStatus}>{item.status}</Text>
      <FlatList
        data={item.items}
        renderItem={({ item: product }) => (
          <View style={styles.productItem}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
            </View>
            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          </View>
        )}
        keyExtractor={(product, index) => `${item.id}-${index}`}
      />
      <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
    </View>
  );

  const renderContent = ({ item }) => {
    switch (item.type) {
      case 'profile':
        return (
          <View style={styles.profileInfo}>
            <Image 
              source={localUserData.profileImage || require('../assets/15.png')} 
              style={styles.profileImage} 
            />
            <TouchableOpacity style={styles.editImageButton}>
              <MaterialIcons name="camera-alt" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        );
      case 'details':
        return (
          <View style={styles.detailsCard}>
            {renderDetailItem('Name', localUserData.name, 'name')}
            {renderDetailItem('Email', localUserData.email, 'email')}
            {renderDetailItem('Phone', localUserData.phone, 'phone')}
            {renderDetailItem('Address', localUserData.address, 'address')}
          </View>
        );
      case 'period':
        return (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Period Information</Text>
            {renderDetailItem('Last Period', localUserData.lastPeriodStart, 'lastPeriodStart')}
            {renderDetailItem('Period Duration', localUserData.periodDays, 'periodDays')}
            {renderDetailItem('Cycle Length', localUserData.cycleDays, 'cycleDays')}
          </View>
        );
      case 'orders':
        return (
          <View style={styles.ordersSection}>
            <Text style={styles.sectionTitle}>My Orders</Text>
            <FlatList
              data={[
                { 
                  id: '1', 
                  date: '2023-05-15', 
                  status: 'Delivered', 
                  items: [
                    { name: 'Menstrual Cup', quantity: 1, price: 25.99, image: 'https://via.placeholder.com/50' },
                    { name: 'Organic Pads', quantity: 2, price: 12.50, image: 'https://via.placeholder.com/50' }
                  ],
                  total: 50.99
                },
                { 
                  id: '2', 
                  date: '2023-06-02', 
                  status: 'In Transit', 
                  items: [
                    { name: 'Organic Tampons', quantity: 3, price: 15.00, image: 'https://via.placeholder.com/50' }
                  ],
                  total: 45.00
                },
              ]}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id}
              ListEmptyComponent={<Text style={styles.emptyOrdersText}>No orders yet</Text>}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#E91E63" barStyle="light-content" />
      
      <LinearGradient
        colors={['#E91E63', '#FF4081']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <FlatList
          data={[
            { key: 'profile', type: 'profile' },
            { key: 'details', type: 'details' },
            { key: 'period', type: 'period' },
            { key: 'orders', type: 'orders' },
          ]}
          renderItem={renderContent}
          keyExtractor={item => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />
      </KeyboardAvoidingView>
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
    color: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editImageButton: {
    position: 'absolute',
    right: '35%',
    bottom: 0,
    backgroundColor: '#E91E63',
    borderRadius: 20,
    padding: 8,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D3A',
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8F90A6',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 16,
    color: '#2D2D3A',
    fontWeight: '500',
  },
  editInput: {
    fontSize: 16,
    color: '#2D2D3A',
    borderBottomWidth: 1,
    borderBottomColor: '#E91E63',
    paddingVertical: 4,
  },
  ordersSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  orderItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4EC',
    paddingBottom: 16,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '500',
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D2D3A',
  },
  productQuantity: {
    fontSize: 12,
    color: '#8F90A6',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D3A',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E91E63',
    marginTop: 8,
    textAlign: 'right',
  },
  emptyOrdersText: {
    fontSize: 16,
    color: '#8F90A6',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProfileManagementScreen;