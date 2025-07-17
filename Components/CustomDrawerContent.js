import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';

const CustomDrawerContent = (props) => {
    const { logout } = useAuth();

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />

            <View style={styles.logoutContainer}>
                <TouchableOpacity
                    onPress={logout}
                    style={styles.logoutButton}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
};
export default CustomDrawerContent;
const styles = StyleSheet.create({
    logoutContainer: {
        marginTop: 20,
        paddingHorizontal: 15,
    },
    logoutButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#f44336',
        borderRadius: 8,
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
