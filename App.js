import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './Store';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SettingScreen from './screens/SettingScreen';
import AccountScreen from './screens/AccountScreen';
import SupportScreen from './screens/SupportScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EditProfileScreen from './screens/EditProfileScreen';
import NotificationScreen from './screens/NotificationScreen';

const Stack = createStackNavigator(); 

const App = () => (
  <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Setting" screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} /> */}
        <Stack.Screen 
          name="Setting" 
          component={SettingScreen}
          options={({ navigation }) => ({
            headerShown: true, 
            headerTitle: 'Setting',
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color="black" 
                style={{marginLeft: 10}}
                onPress={() => navigation.goBack()}
              />
            )
          })}
        />
        
        <Stack.Screen 
          name="Notifications" 
          component={NotificationScreen}
          options={({ navigation }) => ({
            headerShown: true, 
            headerTitle: 'Notifications',
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color="black" 
                style={{marginLeft: 10}}
                onPress={() => navigation.goBack()}
              />
            )
          })}
        />

        <Stack.Screen 
          name="Account" 
          component={AccountScreen}
          options={({ navigation }) => ({
            headerShown: true, 
            headerTitle: 'Account',
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color="black" 
                style={{marginLeft: 10}}
                onPress={() => navigation.goBack()}
              />
            )
          })}
        />

        <Stack.Screen 
          name="Support" 
          component={SupportScreen}
          options={({ navigation }) => ({
            headerShown: true, 
            headerTitle: 'Support',
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color="black" 
                style={{marginLeft: 10}}
                onPress={() => navigation.goBack()}
              />
            )
          })}
        />

        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: 'Profile',
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Ionicons 
                name="arrow-back" 
                size={24}
                color="black"
                style={{marginLeft: 10}}
                onPress={() => navigation.goBack()}
              />
            )
          })}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  </Provider>
);

export default App;