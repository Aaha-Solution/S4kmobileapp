import React, { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import NoInternetScreen from './screens/NoInternetScreen'; // ✅
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './Store';
import { StripeProvider } from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';

// Screens (imported as before)
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen.js';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import AgeSelectionScreen from './screens/AgeSelectionScreen';
import AccountScreen from './screens/AccountScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ViewProfileScreen from './screens/ViewProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen.js';
import VideoPlayerScreen from './screens/VideoPlayerScreen.js';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import SignupScreen from './screens/SignUpScreen.js';
import AdminPannel from './screens/AdminPannelScreen.js';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();

const App = () => {
	const [isConnected, setIsConnected] = useState(true);
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			console.log('Connection type:', state.type);
			console.log('Is connected?', state.isConnected);
			setIsConnected(state.isConnected && state.isInternetReachable);
		});

		NetInfo.fetch().then(state => {
			setIsConnected(state.isConnected && state.isInternetReachable);
			setIsChecking(false);
		});

		return () => unsubscribe();
	}, []);

	if (isChecking) return null; // Or splash screen

	if (!isConnected) return <NoInternetScreen />;
	try {
		return (

			<StripeProvider publishableKey="pk_test_51RbK6IH6OK1hLW4ieNUI38Hdxs9DdFOaBJ7XkqLH8vqTT5oGlbRKColi1J3SgPhMZNrBIvNA3MQj7sV0IjDta54V00W3f5HIXg">
				<Provider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<NavigationContainer>
							<Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F0F8FF' } }}>
								<Stack.Screen name="SplashScreen" component={SplashScreen} />
								<Stack.Screen name="AdminPannel" component={AdminPannel} />
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
										headerStyle: { backgroundColor: '#87CEEB' },
										headerTitleStyle: { fontWeight: 'bold', color: '#4B0082', },
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
										headerStyle: { backgroundColor: '#87CEEB' },
										headerTitleStyle: { fontWeight: 'bold', color: '#4B0082' },
									}}
								/>

								<Stack.Screen name="MainTabs" component={BottomTabNavigator} />
								<Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
								<Stack.Screen
									name="ViewProfile"
									component={ViewProfileScreen}
									options={({ navigation }) => ({
										headerShown: true,
										headerTitle: 'Profile',
										headerTitleAlign: 'center',
										headerTransparent: true,
										headerStyle: { backgroundColor: '#87CEEB', color: 'black' },
										headerLeft: () => (
											<Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 10 }} onPress={() => navigation.navigate("AccountScreen")} />
										)
									})}
								/>
								<Stack.Screen
									name="AccountScreen"
									component={AccountScreen}
									options={({ navigation }) => ({
										headerShown: true,
										headerTitle: 'Account',
										headerTitleAlign: 'center',
										headerTransparent: true,
										headerStyle: { backgroundColor: '#87CEEB' },
										headerTitleStyle: { fontWeight: 'bold', color: 'black' },
										headerLeft: () => (
											<Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 10 }} onPress={() => navigation.navigate('MainTabs', { screen: 'Setting' })} />
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
										headerTransparent: true,
										headerStyle: { backgroundColor: '#87CEEB' },
										headerLeft: () => (
											<Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 10 }} onPress={() => navigation.navigate("AccountScreen")} />
										)
									})}
								/>
								<Stack.Screen
									name="EditProfileScreen"
									component={EditProfileScreen}
									options={({ navigation }) => ({
										headerShown: true,
										headerTitle: 'Edit Profile',
										headerTitleAlign: 'center',
										headerTransparent: true,
										headerStyle: { backgroundColor: '#87CEEB' },
										headerLeft: () => (
											<Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 10 }} onPress={() => navigation.navigate('ViewProfile')} />
										)
									})}
								/>
								<Stack.Screen
									name="SignupScreen"
									component={SignupScreen}
									options={({ navigation }) => ({
										headerShown: false,
										headerTitle: 'Signup',
										headerTitleAlign: 'center',
										headerTransparent: true,
										headerStyle: { backgroundColor: '#87CEEB' },
										headerLeft: () => (
											<Ionicons name="arrow-back" size={24} color="black" style={{ marginLeft: 10 }} onPress={() => navigation.navigate('Login')} />
										)
									})}
								/>
							</Stack.Navigator>
						</NavigationContainer>
						<Toast />
					</PersistGate>
				</Provider>
			</StripeProvider>
		);
	}catch(err) {
		console.error("Error in App component:", err);
		return ; // Or you can return a fallback UI
	}
}

export default App;
