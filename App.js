import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './Store';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SettingScreen from './screens/SettingScreen';
import AccountScreen from './screens/AccountScreen';
import AboutScreen from './screens/AboutScreen.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EditProfileScreen from './screens/EditProfileScreen';
import NotificationScreen from './screens/NotificationScreen';
import ViewProfileScreen from './screens/ViewProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen.js';


const Stack = createStackNavigator(); 

const App = () => (
  <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Setting" screenOptions={{ headerShown: false }}>
        
        <Stack.Screen 
        name="SplashScreen" 
        component={SplashScreen}
         />

       <Stack.Screen
        name="Login"
         component={LoginScreen}
        />

        <Stack.Screen 
          name="Setting" 
          component={SettingScreen}
          options={({ navigation }) => ({
            headerShown: true, 
            headerTransparent: true,
            headerTitle: 'Setting',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#E0B0FF',
            },
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
            headerTransparent: true,
            headerStyle: {
              backgroundColor: '#E0B0FF',
            },
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
          name="About" 
          component={AboutScreen}
          options={({ navigation }) => ({
            headerShown: true, 
            headerTitle: 'About',
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
            headerTitle: 'Edit Profile',
            headerTitleAlign: 'center',
            headerTransparent: true,
            headerStyle:{
              backgroundColor: '#E0B0FF',
            },
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
          name="ViewProfile"
          component={ViewProfileScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: 'Profile',
            headerTitleAlign: 'center',
            headerTransparent: true,
            headerStyle: {
              backgroundColor: '#E0B0FF',
            },
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
          name="ChangePasswordScreen"
          component={ChangePasswordScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: 'Change Password',
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