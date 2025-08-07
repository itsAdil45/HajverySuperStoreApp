// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
// import { LogOut, Pencil, Lock, CreditCard, Package, ShieldCheck, FileText, ChevronRight, User, Bell, Settings, Heart } from 'lucide-react-native';

// const { width } = Dimensions.get('window');

// export default function ProfileScreen({ navigation }) {
//     return (
//         <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//             {/* Header with gradient background */}
//             <View style={styles.header}>
//                 <View style={styles.headerGradient}>
//                     <View style={styles.avatarContainer}>
//                         <View style={styles.avatarPlaceholder}>
//                             <User size={40} color="#22c55e" />
//                         </View>
//                     </View>
//                     <Text style={styles.name}>Smith Mate</Text>
//                     <Text style={styles.email}>smithmate@example.com</Text>
//                     <View style={styles.profileStats}>
//                         <View style={styles.statItem}>
//                             <Text style={styles.statNumber}>12</Text>
//                             <Text style={styles.statLabel}>Total Orders</Text>
//                         </View>
//                     </View>
//                 </View>
//             </View>



//             {/* Options List */}
//             <View style={styles.optionList}>
//                 <Text style={styles.sectionTitle}>Account</Text>
//                 <View style={styles.optionGroup}>
//                     <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
//                         <OptionItem
//                             icon={<Pencil size={20} color="#22c55e" />}
//                             label="Edit Profile"
//                             subtitle="Update your personal information"
//                             iconBg="#dcfce7"

//                         />
//                     </TouchableOpacity>
//                     <OptionItem
//                         icon={<Lock size={20} color="#3b82f6" />}
//                         label="Change Password"
//                         subtitle="Secure your account"
//                         iconBg="#dbeafe"
//                     />

//                 </View>

//                 <Text style={styles.sectionTitle}>Orders & Support</Text>
//                 <View style={styles.optionGroup}>
//                     <OptionItem
//                         icon={<Package size={20} color="#f59e0b" />}
//                         label="My Orders"
//                         subtitle="Track your order history"
//                         iconBg="#fef3c7"
//                     />
//                     <OptionItem
//                         icon={<ShieldCheck size={20} color="#10b981" />}
//                         label="Privacy Policy"
//                         subtitle="How we protect your data"
//                         iconBg="#d1fae5"
//                     />
//                     <OptionItem
//                         icon={<FileText size={20} color="#6b7280" />}
//                         label="Terms & Conditions"
//                         subtitle="Our terms of service"
//                         iconBg="#f3f4f6"
//                     />
//                 </View>
//             </View>

//             <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
//                 <LogOut size={18} color="white" />
//                 <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>

//             <View style={styles.footer}>
//                 <Text style={styles.footerText}>Version 1.0.0</Text>
//             </View>
//         </ScrollView>
//     );
// }

// function OptionItem({ icon, label, subtitle, iconBg }) {
//     return (
//         <TouchableOpacity style={styles.optionItem} activeOpacity={0.7}>
//             <View style={styles.optionLeft}>
//                 <View style={[styles.optionIconContainer, { backgroundColor: iconBg }]}>
//                     {icon}
//                 </View>
//                 <View style={styles.optionTextContainer}>
//                     <Text style={styles.optionLabel}>{label}</Text>
//                     <Text style={styles.optionSubtitle}>{subtitle}</Text>
//                 </View>
//             </View>
//             <ChevronRight size={18} color="#9ca3af" />
//         </TouchableOpacity>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f8fafc'
//     },
//     header: {
//         backgroundColor: '#22c55e',
//         paddingBottom: 30,
//         borderBottomLeftRadius: 30,
//         borderBottomRightRadius: 30,
//         overflow: 'hidden',
//     },
//     headerGradient: {
//         alignItems: 'center',
//         paddingTop: 60,
//         paddingHorizontal: 20,
//     },
//     avatarContainer: {
//         position: 'relative',
//         marginBottom: 16,
//     },
//     avatarPlaceholder: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         backgroundColor: '#fff',
//         alignItems: 'center',
//         justifyContent: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 5,
//     },
//     editIcon: {
//         position: 'absolute',
//         bottom: 0,
//         right: 0,
//         backgroundColor: '#16a34a',
//         padding: 8,
//         borderRadius: 16,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     name: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#fff',
//         marginBottom: 4,
//     },
//     email: {
//         fontSize: 14,
//         color: '#dcfce7',
//         marginBottom: 20,
//     },
//     profileStats: {
//         flexDirection: 'row',
//         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         borderRadius: 16,
//         padding: 16,
//         alignItems: 'center',
//     },
//     statItem: {
//         alignItems: 'center',
//         flex: 1,
//     },
//     statNumber: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#fff',
//     },
//     statLabel: {
//         fontSize: 12,
//         color: '#dcfce7',
//         marginTop: 2,
//     },
//     statDivider: {
//         width: 1,
//         height: 30,
//         backgroundColor: 'rgba(255, 255, 255, 0.3)',
//         marginHorizontal: 20,
//     },
//     quickActions: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingHorizontal: 20,
//         paddingVertical: 20,
//         backgroundColor: '#fff',
//         marginHorizontal: 16,
//         marginTop: -20,
//         borderRadius: 16,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 3,
//     },
//     quickActionItem: {
//         alignItems: 'center',
//         flex: 1,
//     },
//     quickActionIcon: {
//         width: 48,
//         height: 48,
//         borderRadius: 24,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 8,
//     },
//     quickActionText: {
//         fontSize: 12,
//         color: '#6b7280',
//         fontWeight: '500',
//     },
//     optionList: {
//         paddingHorizontal: 20,
//         marginTop: 20,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#1f2937',
//         marginBottom: 12,
//         marginTop: 20,
//     },
//     optionGroup: {
//         backgroundColor: '#fff',
//         borderRadius: 16,
//         marginBottom: 8,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//         elevation: 2,
//     },
//     optionItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingVertical: 16,
//         paddingHorizontal: 16,
//         borderBottomColor: '#f3f4f6',
//         borderBottomWidth: 1,
//     },
//     optionLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     optionIconContainer: {
//         width: 44,
//         height: 44,
//         borderRadius: 22,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginRight: 12,
//     },
//     optionTextContainer: {
//         flex: 1,
//     },
//     optionLabel: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#1f2937',
//         marginBottom: 2,
//     },
//     optionSubtitle: {
//         fontSize: 13,
//         color: '#6b7280',
//     },
//     logoutBtn: {
//         backgroundColor: '#ef4444',
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         margin: 20,
//         paddingVertical: 16,
//         borderRadius: 16,
//         shadowColor: '#ef4444',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//         elevation: 5,
//     },
//     logoutText: {
//         color: 'white',
//         fontWeight: 'bold',
//         marginLeft: 8,
//         fontSize: 16,
//     },
//     footer: {
//         alignItems: 'center',
//         paddingVertical: 20,
//     },
//     footerText: {
//         fontSize: 12,
//         color: '#9ca3af',
//     },
// });

import { View, Text } from "react-native";
import React from "react";

export default function ProfileScreen() {
    return (
        <View>
            <Text>ProfileScreen</Text>
        </View>
    );
}
