import React from 'react';
import AppNavigator from './AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );

};

export default App;
