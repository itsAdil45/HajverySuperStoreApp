import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolate,
    runOnJS
} from 'react-native-reanimated';
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
import OrderDetail from './Screens/OrderDetail';
import EditProfileScreen from './Screens/EditProfileScreen';
import MainCategoriesScreen from './Screens/MainCategoriesScreen';
import SearchResultScreen from './Screens/SearchResultScreen';
import DealDetails from './Screens/DealDetails';
import Notification from './Screens/Notification';
import appColors from './colors/appColors';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
import { useAuth } from './contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Custom transition animations
const slideFromRight = {
    gestureDirection: 'horizontal',
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                duration: 300,
            },
        },
        close: {
            animation: 'timing',
            config: {
                duration: 300,
            },
        },
    },
    cardStyleInterpolator: ({ current, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                        }),
                    },
                ],
            },
            overlayStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                }),
            },
        };
    },
};

const slideFromBottom = {
    gestureDirection: 'vertical',
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                duration: 400,
            },
        },
        close: {
            animation: 'timing',
            config: {
                duration: 300,
            },
        },
    },
    cardStyleInterpolator: ({ current, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                        }),
                    },
                ],
            },
        };
    },
};

const fadeTransition = {
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                duration: 300,
            },
        },
        close: {
            animation: 'timing',
            config: {
                duration: 200,
            },
        },
    },
    cardStyleInterpolator: ({ current }) => {
        return {
            cardStyle: {
                opacity: current.progress,
            },
        };
    },
};

const scaleTransition = {
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                duration: 300,
            },
        },
        close: {
            animation: 'timing',
            config: {
                duration: 250,
            },
        },
    },
    cardStyleInterpolator: ({ current, next }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        scale: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                        }),
                    },
                ],
                opacity: current.progress,
            },
            overlayStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                }),
            },
        };
    },
};

// Animated Tab Icon Component
const AnimatedTabIcon = ({ name, color, size, focused }) => {
    const scale = useSharedValue(focused ? 1.2 : 1);
    const opacity = useSharedValue(focused ? 1 : 0.7);

    React.useEffect(() => {
        scale.value = withTiming(focused ? 1.2 : 1, { duration: 200 });
        opacity.value = withTiming(focused ? 1 : 0.7, { duration: 200 });
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={animatedStyle}>
            <Feather name={name} size={size} color={color} />
        </Animated.View>
    );
};

// Animated Header Button
const AnimatedHeaderButton = ({ onPress, iconName }) => {
    const scale = useSharedValue(1);

    const handlePress = () => {
        scale.value = withTiming(0.9, { duration: 100 }, () => {
            scale.value = withTiming(1, { duration: 100 });
        });
        runOnJS(onPress)();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <TouchableOpacity onPress={handlePress} style={{ marginLeft: 15 }}>
            <Animated.View style={animatedStyle}>
                <Feather name={iconName} size={25} color="black" />
            </Animated.View>
        </TouchableOpacity>
    );
};

const AuthStack = ({ onLogin }) => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                ...TransitionPresets.SlideFromRightIOS,
            }}
        >
            <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{
                    ...fadeTransition,
                }}
            />
            <Stack.Screen
                name="Login"
                options={{
                    ...slideFromRight,
                }}
            >
                {(props) => <LoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen
                name="SignUp"
                component={SignupScreen}
                options={{
                    ...slideFromRight,
                }}
            />
            <Stack.Screen
                name="LocationPickerScreen"
                component={LocationPickerScreen}
                options={{
                    ...slideFromBottom,
                }}
            />
            <Stack.Screen
                name="UserAuth"
                component={UserAuthScreen}
                options={{
                    ...scaleTransition,
                }}
            />
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
                    <AnimatedHeaderButton
                        onPress={() => navigation.openDrawer()}
                        iconName="menu"
                    />
                ),
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    height: 90,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                },
                tabBarActiveTintColor: appColors.Primary_Button,
                tabBarInactiveTintColor: '#8E8E93',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon
                            name="home"
                            size={20}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="CartTab"
                component={CheckoutScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon
                            name="shopping-cart"
                            size={20}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="DealsTab"
                component={AllDeals}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Deals',
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon
                            name="package"
                            size={20}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="CategoryTab"
                component={MainCategoriesScreen}
                options={{
                    tabBarLabel: 'Category',
                    tabBarIcon: ({ color, size, focused }) => (
                        <AnimatedTabIcon
                            name="grid"
                            size={20}
                            color={color}
                            focused={focused}
                        />
                    ),
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
                drawerStyle: {
                    backgroundColor: '#fff',
                    width: screenWidth * 0.8,
                },
                overlayColor: 'rgba(0,0,0,0.5)',
                drawerType: 'slide',
                swipeEnabled: true,
                swipeEdgeWidth: 50,
            }}
        >
            <Drawer.Screen
                name="MainTabs"
                component={MainTabNavigator}
                options={{
                    drawerLabel: 'Home',
                }}
            />
            {/* <Drawer.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    drawerLabel: 'Edit Profile',
                }}
            /> */}
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
        <Stack.Navigator
            screenOptions={{
                gestureEnabled: true,
                headerBackTitleVisible: false,
                headerTitleAlign: 'center',
            }}
        >
            <Stack.Screen
                name="MainDrawer"
                component={MainDrawerNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="OrderDetail"
                component={OrderDetail}
            />
            <Stack.Screen
                name="main Categories"
                component={MainCategoriesScreen}
                options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                }}
            />
            <Stack.Screen
                name="Products"
                component={CategoryProductsScreen}
                options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                }}
            />
            <Stack.Screen
                name="SearchResult"
                component={SearchResultScreen}
                options={{
                    headerShown: true,
                    ...fadeTransition,
                }}
            />
            <Stack.Screen
                name="Product"
                component={ProductScreen}
                options={{
                    headerShown: false,
                    ...scaleTransition,
                }}
            />
            <Stack.Screen
                name="Notification"
                component={Notification}
                options={{
                    headerShown: false,
                    ...scaleTransition,
                }}
            />
            <Stack.Screen
                name="DealDetails"
                component={DealDetails}
                options={{
                    headerShown: false,
                    ...scaleTransition,
                }}
            />
            <Stack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{
                    headerShown: false,
                    ...slideFromBottom,
                }}
            />
            <Stack.Screen
                name="LocationPickerScreen"
                component={LocationPickerScreen}
                options={{
                    headerShown: false,
                    ...slideFromBottom,
                }}
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
                    <Stack.Screen
                        name="Splash"
                        component={SplashScreen}
                        options={{
                            ...fadeTransition,
                        }}
                    />
                ) : token ? (
                    <Stack.Screen
                        name="MainApp"
                        component={MainStackNavigator}
                        options={{
                            ...fadeTransition,
                        }}
                    />
                ) : (
                    <Stack.Screen
                        name="Auth"
                        component={AuthStack}
                        options={{
                            ...fadeTransition,
                        }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;