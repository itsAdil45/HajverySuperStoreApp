import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function EditProfileScreen({ navigation }) {
    const [form, setForm] = useState({
        name: 'Smith Mate',
        email: 'smithmate@example.com',
        phone: '(205) 555-0100',
        address: '8502 Preston Rd. Inglewood, USA',
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Success', 'Profile updated successfully!');
        }, 1500);
    };

    const handleBack = () => {
        navigation?.goBack();
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                    <Ionicons name='arrow-back' size={20} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                        <Feather name='users' size={40} color="#22c55e" />

                    </View>
                    <TouchableOpacity style={styles.cameraIcon} activeOpacity={0.7}>
                        <Feather name='camera' size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.changePhotoText}>Change Profile Photo</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.formGroup}>
                    <Field
                        label="Full Name"
                        value={form.name}
                        onChangeText={(v) => handleChange('name', v)}
                        icon={<Feather name='user' size={20} color="#6b7280" />}
                        placeholder="Enter your full name"
                    />
                    <Field
                        label="Email Address"
                        value={form.email}
                        onChangeText={(v) => handleChange('email', v)}
                        icon={<Feather name='mail' size={20} color="#6b7280" />}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                    />
                    <Field
                        label="Mobile Number"
                        value={form.phone}
                        onChangeText={(v) => handleChange('phone', v)}
                        icon={<Feather name='phone' size={20} color="#6b7280" />}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                    />
                    <Field
                        label="Address"
                        value={form.address}
                        onChangeText={(v) => handleChange('address', v)}
                        icon={<Ionicons name='location' size={20} color="#6b7280" />}
                        placeholder="Enter your address"
                        multiline={true}
                        numberOfLines={3}
                    />
                </View>
            </View>

            {/* Update Button */}
            <TouchableOpacity
                style={[styles.updateBtn, isLoading && styles.updateBtnDisabled]}
                onPress={handleUpdate}
                disabled={isLoading}
                activeOpacity={0.8}
            >
                {isLoading ? (
                    <Text style={styles.updateText}>Updating...</Text>
                ) : (
                    <>
                        <Feather name='check' size={18} color="white" />
                        <Text style={styles.updateText}>Update Profile</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Save Changes Notice */}
            <View style={styles.noticeContainer}>
                <Text style={styles.noticeText}>
                    Your changes will be saved securely and updated across all devices.
                </Text>
            </View>
        </ScrollView>
    );
}

const Field = ({ label, value, onChangeText, icon, placeholder, keyboardType, multiline, numberOfLines }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
                {icon}
            </View>
            <TextInput
                style={[styles.input, multiline && styles.multilineInput]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={numberOfLines}
            />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    headerSpacer: {
        width: 40,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#22c55e',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#22c55e',
        padding: 8,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    changePhotoText: {
        fontSize: 14,
        color: '#22c55e',
        fontWeight: '600',
    },
    formSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
    },
    formGroup: {
        gap: 20,
    },
    fieldContainer: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 12,
        minHeight: 48,
    },
    inputIcon: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        paddingVertical: 12,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    updateBtn: {
        backgroundColor: '#22c55e',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 30,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    updateBtnDisabled: {
        backgroundColor: '#9ca3af',
        shadowColor: '#9ca3af',
    },
    updateText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    noticeContainer: {
        backgroundColor: '#f0f9ff',
        borderWidth: 1,
        borderColor: '#e0f2fe',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 30,
    },
    noticeText: {
        fontSize: 13,
        color: '#0369a1',
        textAlign: 'center',
        lineHeight: 18,
    },
});