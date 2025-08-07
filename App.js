import React from 'react';
import AppNavigator from './AppNavigator';
import 'react-native-gesture-handler';
import { AuthProvider } from './contexts/AuthContext';
import { StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from './config/toastConfig'; // we'll create this next
// import { UserProvider } from './contexts/UserContext';
const App = () => {
  return (
    // <UserProvider>
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
      <Toast />
    </AuthProvider>
    // </UserProvider>
  );

};

export default App;
