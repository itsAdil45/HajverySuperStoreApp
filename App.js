import React from 'react';
import AppNavigator from './AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
const App = () => {
  return (
    <UserProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </UserProvider>
  );

};

export default App;
