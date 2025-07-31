import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CustomDrawerContent from './Components/CustomDrawerContent';
// Auth Screens
import SplashScreen from './Screens/SplashScreen';
import OnboardingScreen from './Screens/OnboardingScreen1';
import LoginScreen from './Screens/LoginScreen';
import SignupScreen from './Screens/SignupScreen';
import UserAuthScreen from './Screens/UserAuthScreen';
// Main App Screens
import HomeScreen from './Screens/Home';
import AllDeals from './Screens/AllDeals';
import CategoryProductsScreen from './Screens/CategoryProductsScreen';
import ProductScreen from './Screens/ProductScreen';
import ProfileScreen from './Screens/ProfileScreen';
import CheckoutScreen from './Screens/CheckoutScreen';
import LocationPickerScreen from './Screens/LocationPickerScreen';
import PaymentScreen from './Screens/PaymentScreen';
import OrderScreen from './Screens/OrderScreen';
import EditProfileScreen from './Screens/EditProfileScreen';
import MainCategoriesScreen from './Screens/MainCategoriesScreen';
import SearchResultScreen from './Screens/SearchResultScreen';
import DealDetails from './Screens/DealDetails';
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
                        <Feather name="menu" size={25} color="black" />
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
                    tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />
                    ,
                }}
            />
            <Tab.Screen
                name="CartTab"
                component={CheckoutScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: ({ color, size }) => <Feather name="shopping-cart" size={size} color={color} />
                }}
            />

            <Tab.Screen
                name="DealsTab"
                component={AllDeals}
                options={{
                    tabBarLabel: 'Deals',
                    tabBarIcon: ({ color, size }) => <Feather name="package" size={size} color={color} />
                }}
            />
            <Tab.Screen
                name="CategoryTab"
                component={MainCategoriesScreen}
                options={{
                    tabBarLabel: 'Category',
                    tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} />
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
            <Drawer.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    drawerLabel: 'Edit Profile',
                }}
            />
            <Drawer.Screen
                name="Orders"
                component={OrderScreen}
                options={{
                    drawerLabel: 'Orders',
                }}
            />
        </Drawer.Navigator>
    );
};

// Create a main stack navigator that includes both drawer and other screens
const MainStackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MainDrawer"
                component={MainDrawerNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="main Categories"
                component={MainCategoriesScreen}
                options={{ headerShown: true }}
            />
            <Stack.Screen
                name="CategoryProducts"
                component={CategoryProductsScreen}
                options={{ headerShown: true }}
            />
            <Stack.Screen
                name="SearchResult"
                component={SearchResultScreen}
                options={{ headerShown: true }}
            />
            <Stack.Screen
                name="Product"
                component={ProductScreen}
                options={{ headerShown: true }}
            />
            <Stack.Screen
                name="DealDetails"
                component={DealDetails}
                options={{ headerShown: true }}
            />
            <Stack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="LocationPickerScreen"
                component={LocationPickerScreen}
                options={{ headerShown: false }}
            />

        </Stack.Navigator>
    );
};


const AppNavigator = () => {
    const [showSplash, setShowSplash] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowSplash(false);
        }, 4000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {showSplash ? (
                    <Stack.Screen name="Splash" component={SplashScreen} />
                ) : token ? (
                    <Stack.Screen name="MainApp" component={MainStackNavigator} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;