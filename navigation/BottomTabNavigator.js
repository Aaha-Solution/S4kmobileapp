import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import VideoListScreen from '../screens/VideoListScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SettingScreen from '../screens/SettingScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="VideoListScreen"
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'VideoListScreen') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        } else if (route.name === 'Payment') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#8A2BE2',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
        backgroundColor: '#fff',
      },
      headerShown: false, // Hide stack header in tabs
    })}
  >
    <Tab.Screen
      name="Settings"
      component={SettingScreen}
      options={{ title: 'Settings' }}
    />
    <Tab.Screen
      name="VideoListScreen"
      component={VideoListScreen}
      options={{ title: 'Home',
        headerShown: 'true',
        headerTitleAlign:'center',
        headerStyle: {
            backgroundColor: '#E0B0FF',
        }
       }}
    />   
    <Tab.Screen
      name="Payment"
      component={PaymentScreen}
      options={{ title: 'Payment' }}
    />
  </Tab.Navigator>
);

export default BottomTabNavigator; 