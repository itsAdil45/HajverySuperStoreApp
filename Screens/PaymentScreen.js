import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
    Modal,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
import usePut from '../hooks/usePut'; // Add this import

const PhoneModal = ({ visible, onClose, tempPhone, setTempPhone, onUpdate, loading }) => (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.phoneModalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Update Phone Number</Text>
                    <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.phoneInputContainer}>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter phone number"
                        value={tempPhone}
                        onChangeText={setTempPhone}
                        keyboardType="phone-pad"
                        maxLength={11}
                    />
                </View>

                <View style={styles.phoneModalButtons}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.updateBtn, loading && styles.disabledBtn]}
                        onPress={onUpdate}
                        disabled={loading}
                    >
                        <Text style={styles.updateBtnText}>{loading ? 'Updating...' : 'Update'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

import usePostFormData from '../hooks/usePostFormData';
import useGet from '../hooks/useGet';

export default function PaymentScreen({ navigation, route }) {
    const { total } = route.params || {};
    const { user, setUser } = useAuth();

    const [selectedMethod, setSelectedMethod] = useState(null);
    const [receiptImage, setReceiptImage] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedPhone, setSelectedPhone] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [tempPhone, setTempPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const [charges, setCharges] = useState({
        delivery: 50,  // Default delivery charge
        vat: 0,        // Will calculate based on total
        other: 0
    });

    const { put: updateProfile, loading: updateLoading, error: updateError } = usePut();
    const { postFormData, loading: checkoutLoading, error: checkoutError } = usePostFormData();
    const { refetch: refetchCart } = useGet('/cart');
    useEffect(() => {
        if (total) {
            const vatAmount = parseFloat(total) * 0.05;
            setCharges(prev => ({
                ...prev,
                vat: Math.round(vatAmount * 100) / 100
            }));
        }
    }, [total]);

    const finalTotal = useMemo(() => {
        const subtotal = parseFloat(total) || 0;
        const totalCharges = charges.delivery + charges.vat + charges.other;
        return subtotal + totalCharges;
    }, [total, charges]);

    const getDisplayAddress = (fullAddress) => {
        if (!fullAddress) return "No address selected";
        return fullAddress.split("+")[0].trim();
    };

    const updateUserProfile = async (updates) => {
        if (!user) return false;

        try {
            const profileData = {
                name: user.name,
                address: updates.address || user.address,
                phone: updates.phone || user.phone,
                ...updates
            };

            console.log('Updating profile with:', profileData);

            const result = await updateProfile('/api/user/update-profile', profileData, true);

            if (result) {
                const updatedUser = { ...user, ...updates };
                setUser(updatedUser);
                console.log('Profile updated successfully');
                return true;
            } else {
                console.error('Failed to update profile:', updateError);
                Alert.alert('Error', 'Failed to update profile. Please try again.');
                return false;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
            return false;
        }
    };

    useEffect(() => {
        if (user) {
            if (user.address && !selectedAddress) {
                setSelectedAddress(user.address.split("+")[0].trim());
            }
            if (user.phone) {
                setSelectedPhone(user.phone);
            }
        }
    }, [user]);

    useEffect(() => {
        const handleNewAddress = async () => {
            const { selectedAddress: routeAddress } = route.params || {};

            if (routeAddress && user) {
                const displayAddress = routeAddress.split("+")[0].trim();
                setSelectedAddress(displayAddress);

                const success = await updateUserProfile({ address: routeAddress });

                if (success) {
                    navigation.setParams({ selectedAddress: undefined });
                } else {
                    setSelectedAddress(user.address ? user.address.split("+")[0].trim() : null);
                }
            }
        };

        if (route.params?.selectedAddress) {
            handleNewAddress();
        }
    }, [route.params, navigation, user]);

    const handleAddressSelection = () => {
        navigation.replace('LocationPickerScreen', {
            returnScreen: 'Payment',
        });
    };

    const handlePhoneUpdate = async () => {
        if (!tempPhone.trim()) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        const success = await updateUserProfile({ phone: tempPhone });

        if (success) {
            setSelectedPhone(tempPhone);
            setPhoneModalVisible(false);
            setTempPhone('');
        }
    };

    const selectImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            return Alert.alert("Permission Denied", "You need to allow access to upload receipt.");
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.cancelled && result.assets && result.assets.length > 0) {
            setReceiptImage(result.assets[0].uri);
        }
    };

    const placeOrder = async () => {
        // Validation
        if (!selectedMethod) {
            return Alert.alert("Select Payment Method", "Please choose a payment method.");
        }

        if (selectedMethod === 'online' && !receiptImage) {
            return Alert.alert("Upload Receipt", "Receipt is required for online payment.");
        }

        if (!user?.address) {
            return Alert.alert("Select Address", "Please select a delivery address.");
        }

        if (!selectedPhone) {
            return Alert.alert("Phone Required", "Please add a contact phone number.");
        }

        setLoading(true);

        try {
            const checkoutData = {
                paymentMethod: selectedMethod,
                'charges[delivery]': charges.delivery,
                'charges[vat]': charges.vat,
                'charges[other]': charges.other
            };

            if (selectedMethod === 'online' && receiptImage) {
                checkoutData.receipt = receiptImage;
            }

            console.log('Placing order with data:', checkoutData);

            const result = await postFormData('/api/orders/checkout', checkoutData, true);

            if (result) {
                refetchCart();

                Alert.alert(
                    "Order Placed Successfully!",
                    `Your order has been placed with ${selectedMethod.toUpperCase()} payment.\nTotal: Rs${finalTotal.toFixed(2)}`,
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'MainDrawer' }],
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(
                    "Order Failed",
                    checkoutError || "Failed to place order. Please try again."
                );
            }

        } catch (error) {
            console.error('Checkout error:', error);
            Alert.alert("Error", "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const AddressModal = () => (
        <Modal
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
            transparent={false}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.modalCloseBtn}
                    >
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Address</Text>
                </View>

                <View style={styles.modalContent}>
                    {user?.address && (
                        <TouchableOpacity
                            style={styles.addressItem}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="location-outline" size={20} color="#53B175" />
                            <View style={styles.addressTextContainer}>
                                <Text style={styles.addressTitle}>Current Address</Text>
                                <Text style={styles.addressText}>{getDisplayAddress(user.address)}</Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color="#53B175" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.addAddressBtn}
                        onPress={() => {
                            setModalVisible(false);
                            handleAddressSelection();
                        }}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#53B175" />
                        <Text style={styles.addAddressText}>Add New Address</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Information</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="location" size={20} color="#53B175" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Delivering to</Text>
                                    <Text style={styles.infoValue}>
                                        {getDisplayAddress(user?.address)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                style={styles.changeBtn}
                                disabled={updateLoading}
                            >
                                <Text style={styles.changeBtnText}>
                                    {updateLoading ? 'Updating...' : 'Change'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="call" size={20} color="#53B175" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Contact</Text>
                                    <Text style={styles.infoValue}>
                                        {selectedPhone || "No phone number"}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.changeBtn}
                                onPress={() => {
                                    setTempPhone(selectedPhone || '');
                                    setPhoneModalVisible(true);
                                }}
                                disabled={updateLoading}
                            >
                                <Text style={styles.changeBtnText}>
                                    {updateLoading ? 'Updating...' : 'Change'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Order Summary */}
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryCard}>
                        {/* Header with icon */}
                        <View style={styles.summaryHeader}>
                            <Ionicons name="receipt-outline" size={20} color="#53B175" />
                            <Text style={styles.summaryHeaderText}>Order Details</Text>
                        </View>

                        {/* Items divider */}
                        <View style={styles.summaryDivider} />

                        {/* Summary rows */}
                        <View style={styles.summaryContent}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal:</Text>
                                <Text style={styles.summaryValue}>Rs{parseFloat(total).toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                                <Text style={styles.summaryValue}>Rs{charges.delivery.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>VAT (5%):</Text>
                                <Text style={styles.summaryValue}>Rs{charges.vat.toFixed(2)}</Text>
                            </View>
                            {charges.other > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Other charges:</Text>
                                    <Text style={styles.summaryValue}>Rs{charges.other.toFixed(2)}</Text>
                                </View>
                            )}
                        </View>

                        {/* Total divider */}
                        <View style={[styles.summaryDivider, styles.totalDivider]} />

                        {/* Total row */}
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount:</Text>
                            <Text style={styles.totalAmount}>Rs{finalTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            selectedMethod === 'cod' && styles.selectedOption
                        ]}
                        onPress={() => setSelectedMethod('cod')}
                    >
                        <View style={styles.paymentLeft}>
                            <Ionicons name="cash-outline" size={24} color="#53B175" />
                            <View>
                                <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                                <Text style={styles.paymentSubtitle}>Pay when you receive</Text>
                            </View>
                        </View>
                        <View style={[
                            styles.radioButton,
                            selectedMethod === 'cod' && styles.radioSelected
                        ]}>
                            {selectedMethod === 'cod' && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            selectedMethod === 'online' && styles.selectedOption
                        ]}
                        onPress={() => setSelectedMethod('online')}
                    >
                        <View style={styles.paymentLeft}>
                            <Ionicons name="card-outline" size={24} color="#53B175" />
                            <View>
                                <Text style={styles.paymentTitle}>Online Payment</Text>
                                <Text style={styles.paymentSubtitle}>Pay via bank transfer</Text>
                            </View>
                        </View>
                        <View style={[
                            styles.radioButton,
                            selectedMethod === 'online' && styles.radioSelected
                        ]}>
                            {selectedMethod === 'online' && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Online Payment Details */}
                    {selectedMethod === 'online' && (
                        <View style={styles.onlineSection}>
                            <Text style={styles.bankTitle}>Send Payment To:</Text>

                            <View style={styles.bankDetails}>
                                <View style={styles.bankItem}>
                                    <Ionicons name="phone-portrait-outline" size={20} color="#FF6B35" />
                                    <Text style={styles.bankText}>Easypaisa: 02288028</Text>
                                </View>
                                <View style={styles.bankItem}>
                                    <Ionicons name="musical-note-outline" size={20} color="#FF6B35" />
                                    <Text style={styles.bankText}>JazzCash: 0311-1234567</Text>
                                </View>
                                <View style={styles.bankItem}>
                                    <Ionicons name="business-outline" size={20} color="#FF6B35" />
                                    <Text style={styles.bankText}>Bank Account: 1234567890 (HBL)</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.uploadBtn}
                                onPress={selectImage}
                            >
                                <Ionicons
                                    name={receiptImage ? "cloud-done-outline" : "cloud-upload-outline"}
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.uploadText}>
                                    {receiptImage ? 'Change Receipt' : 'Upload Receipt Screenshot'}
                                </Text>
                            </TouchableOpacity>

                            {receiptImage && (
                                <View style={styles.receiptContainer}>
                                    <Image
                                        source={{ uri: receiptImage }}
                                        style={styles.receiptImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        styles.placeOrderBtn,
                        (loading || checkoutLoading || updateLoading) && styles.disabledBtn
                    ]}
                    onPress={placeOrder}
                    disabled={loading || checkoutLoading || updateLoading}
                >
                    {(loading || checkoutLoading) ? (
                        <Text style={styles.placeOrderText}>Placing Order...</Text>
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                            <Text style={styles.placeOrderText}>Place Order - Rs{finalTotal.toFixed(2)}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <AddressModal />
            <PhoneModal
                visible={phoneModalVisible}
                onClose={() => {
                    setPhoneModalVisible(false);
                    setTempPhone('');
                }}
                tempPhone={tempPhone}
                setTempPhone={setTempPhone}
                onUpdate={handlePhoneUpdate}
                loading={updateLoading}
            />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 40,
        backgroundColor: '#fff',
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    changeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#f0f9f0',
    },
    changeBtnText: {
        color: '#53B175',
        fontWeight: '500',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    },
    totalCard: {
        backgroundColor: '#53B175',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    paymentOption: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#eee',
        elevation: 1,
    },
    selectedOption: {
        borderColor: '#53B175',
        backgroundColor: '#f0f9f0',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 12,
    },
    paymentSubtitle: {
        fontSize: 14,
        color: '#666',
        marginLeft: 12,
        marginTop: 2,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: '#53B175',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#53B175',
    },
    onlineSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        elevation: 1,
    },
    bankTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    bankDetails: {
        marginBottom: 16,
    },
    bankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    bankText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    uploadBtn: {
        backgroundColor: '#53B175',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        color: '#fff',
        fontWeight: '500',
        marginLeft: 8,
    },
    receiptContainer: {
        marginTop: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        overflow: 'hidden',
    },
    receiptImage: {
        width: '100%',
        height: 200,
    },
    bottomContainer: {
        padding: 20,
        backgroundColor: '#fff',
        elevation: 8,
    },
    placeOrderBtn: {
        backgroundColor: '#53B175',
        borderRadius: 12,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    disabledBtn: {
        backgroundColor: '#ccc',
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalCloseBtn: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 16,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f0f9f0',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#53B175',
    },
    addressTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    addressTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#53B175',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#333',
    },
    addAddressBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 2,
        borderColor: '#53B175',
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    addAddressText: {
        color: '#53B175',
        fontWeight: '500',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    phoneModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 24,
        width: '100%',
        maxWidth: 400,
    },
    phoneInputContainer: {
        marginVertical: 20,
    },
    phoneInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    phoneModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    updateBtn: {
        flex: 1,
        backgroundColor: '#53B175',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    updateBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledBtn: {
        opacity: 0.7,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 0,
        elevation: 2,
        overflow: 'hidden',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    summaryHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#53B175',
        marginLeft: 8,
    },
    summaryContent: {
        padding: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 16,
    },
    totalDivider: {
        backgroundColor: '#E0E0E0',
        marginBottom: 12,
    },
    totalRow: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#53B175',
    },
});