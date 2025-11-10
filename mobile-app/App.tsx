import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ReaderScreen from './src/screens/ReaderScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#F8F9FA',
              borderBottomColor: '#CCCCCC',
              borderBottomWidth: 1,
            },
            headerTintColor: '#000000',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              color: '#000000',
            },
            cardStyle: {
              backgroundColor: '#F8F9FA',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: '📖 Accessible Web' }}
          />
          <Stack.Screen 
            name="Reader" 
            component={ReaderScreen} 
            options={{ title: '📄 Text Reader' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: '⚙️ Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});