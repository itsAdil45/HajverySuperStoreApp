import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import { Home, ShoppingCart, Percent, LayoutGrid, Menu } from 'lucide-react-native';
import CustomDrawerContent from './Components/CustomDrawerContent';
// Auth Screens
import SplashScreen from './Screens/SplashScreen';
import OnboardingScreen from './Screens/OnboardingScreen1';
import LoginScreen from './Screens/LoginScreen';
import SignupScreen from './Screens/SignupScreen';
import UserAuthScreen from './Screens/UserAuthScreen';
// Main App Screens
import HomeScreen from './Screens/Home';
import BestDealScreen from './Screens/BestDealScreen';
import CategoryProductsScreen from './Screens/CategoryProductsScreen';
import ProductScreen from './Screens/ProductScreen';
import ProfileScreen from './Screens/ProfileScreen';
import CheckoutScreen from './Screens/CheckoutScreen';
import LocationPickerScreen from './Screens/LocationPickerScreen';
import PaymentScreen from './Screens/PaymentScreen';
import OrderScreen from './Screens/OrderScreen';
import EditProfileScreen from './Screens/EditProfileScreen';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
import { useAuth } from './contexts/AuthContext';

const AuthStack = ({ onLogin }) => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: false,
            }}
        >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen name="SignUp" component={SignupScreen} />
            <Stack.Screen name="LocationPickerScreen" component={LocationPickerScreen} />
            <Stack.Screen name="UserAuth" component={UserAuthScreen} />

        </Stack.Navigator>
    );
};

const MainTabNavigator = ({ navigation }) => {
    const getHeaderTitle = (routeName) => {
        switch (routeName) {
            case 'HomeTab':
                return 'Home';
            case 'CartTab':
                return 'Cart';
            case 'DealsTab':
                return 'Deals';
            case 'CategoryTab':
                return 'Category';
            default:
                return 'Home';
        }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                headerTitle: getHeaderTitle(route.name),
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerTintColor: 'black',
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                        style={{ marginLeft: 15 }}
                    >
                        <Menu size={24} color="black" />
                    </TouchableOpacity>
                ),
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    height: 90,
                },
                tabBarActiveTintColor: 'green',
                tabBarInactiveTintColor: '#8E8E93',
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="CartTab"
                component={CheckoutScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="DealsTab"
                component={BestDealScreen}
                options={{
                    tabBarLabel: 'Deals',
                    tabBarIcon: ({ color, size }) => <Percent color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="CategoryTab"
                component={CategoryProductsScreen}
                options={{
                    tabBarLabel: 'Category',
                    tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
                }}
            />
        </Tab.Navigator>

    );
};

const MainDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: '#007AFF',
                drawerInactiveTintColor: 'black',
            }}
        >

            <Drawer.Screen
                name="MainTabs"
                component={MainTabNavigator}
                options={{
                    drawerLabel: 'Home',
                }}
            />


        </Drawer.Navigator>
    );
};
const AppNavigator = () => {
    const [showSplash, setShowSplash] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowSplash(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {showSplash ? (
                    <Stack.Screen name="Splash" component={SplashScreen} />
                ) : token ? (
                    <>
                        <Stack.Screen name="MainApp" component={MainDrawerNavigator} />
                        <Stack.Screen name="Product" component={ProductScreen} />
                        <Stack.Screen name="LocationPickerScreen" component={LocationPickerScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;