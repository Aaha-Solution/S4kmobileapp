import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './Store';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import AgeSelectionScreen from './screens/AgeSelectionScreen';
import SettingScreen from './screens/SettingScreen';
import AccountScreen from './screens/AccountScreen';
import AboutScreen from './screens/AboutScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EditProfileScreen from './screens/EditProfileScreen';
import NotificationScreen from './screens/NotificationScreen';
import ViewProfileScreen from './screens/ViewProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen.js';

import BottomTabNavigator from './navigation/BottomTabNavigator';

const Stack = createStackNavigator();

const App = () => (
	<Provider store={store}>
		<NavigationContainer>
			<Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
				<Stack.Screen name="SplashScreen" component={SplashScreen} />
				<Stack.Screen name="Login" component={LoginScreen} />
				<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
				<Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
				<Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
				<Stack.Screen
					name="LanguageSelectionScreen"
					component={LanguageSelectionScreen}
					options={{
						headerShown: true,
						title: 'Language',
						headerTitleAlign: 'center',
						headerStyle: { backgroundColor: '#b388eb' },
						headerTintColor: '#fff',
						headerTitleStyle: { fontWeight: 'bold' },
						headerLeft: () => null,
					}}
				/>
				<Stack.Screen
					name="AgeSelectionScreen"
					component={AgeSelectionScreen}
					options={{
						headerShown: true,
						title: 'Age Group',
						headerTitleAlign: 'center',
						headerStyle: { backgroundColor: '#b388eb' },
						headerTintColor: '#fff',
						headerTitleStyle: { fontWeight: 'bold' },
					}}
				/>
				<Stack.Screen name="MainTabs" component={BottomTabNavigator} />
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
								style={{ marginLeft: 10 }}
								onPress={() => navigation.navigate('MainTabs')}
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
								style={{ marginLeft: 10 }}
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
								style={{ marginLeft: 10 }}
								onPress={() => navigation.navigate('Setting')}
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
								style={{ marginLeft: 10 }}
								onPress={() => navigation.navigate('Setting')}
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
						headerLeft: () => (
							<Ionicons
								name="arrow-back"
								size={24}
								color="black"
								style={{ marginLeft: 10 }}
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
								style={{ marginLeft: 10 }}
								onPress={() => navigation.navigate('Setting')}
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
								style={{ marginLeft: 10 }}
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