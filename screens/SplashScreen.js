import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import {initConnection} from 'react-native-iap';
import {
	login,
	setLevel,
	setLanguage,
	setAllPaidAccess,
	setPaidStatus,
} from '../Store/userSlice';

const SplashScreen = ({ navigation }) => {
	const dispatch = useDispatch();

	// Fetch paid courses from backend and update Redux
	const fetchPaidCourses = async (userId, token) => {
		//console.log(" Fetching paid videos for user:", userId);
		try {
			const response = await fetch(`https://api.smile4kids.co.uk/payment/my-paid-videos?user_id=${userId}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,  
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			//console.log(" API response from /my-paid-videos:", data);

			if (Array.isArray(data)) {
				dispatch(setAllPaidAccess(data)); 
				dispatch(setPaidStatus(true));
				//console.log(" Dispatched setAllPaidAccess and setPaidStatus");
				return data;
			} else {
				//console.log(" Invalid data received:", data);
			}
		} catch (err) {
			//console.error(" Error fetching paid courses:", err);
		}
		return [];
	};

	// Check login status and navigate accordingly
	useEffect(() => {
		const checkLoginStatus = async () => {
			console.log("SplashScreen: Starting login status check");
			try {
				const [token, userData, selectedPreferences] = await Promise.all([
					AsyncStorage.getItem('token'),
					AsyncStorage.getItem('user'),
					AsyncStorage.getItem('selectedPreferences'),
				]);
				console.log("SplashScreen: Retrieved storage items - token:", !!token, "userData:", !!userData, "preferences:", !!selectedPreferences);

				if (token && userData) {
					const parsedUser = JSON.parse(userData);
					dispatch(login(parsedUser));
					console.log("SplashScreen: User logged in, parsed user:", parsedUser.users_id, "admin:", parsedUser.is_admin);

					//  Admin check: if true, redirect to AdminPannel
					if (parsedUser.is_admin === 1) {
						console.log('SplashScreen: Admin detected. Redirecting to AdminPannel');
						navigation.replace('AdminPannel');
						return;
					}

					// Fetch paid categories
					let selectedLanguage = null;
					let selectedLevel = null;
					console.log("SplashScreen: Fetching paid courses for user:", parsedUser.users_id);
					const paidData = await fetchPaidCourses(parsedUser.users_id, token);
					console.log("SplashScreen: Paid data received:", paidData?.length || 0, "items");

					if (Array.isArray(paidData) && paidData.length > 0) {
						dispatch(setPaidStatus(true));
						console.log("SplashScreen: User has paid access");

						const prefs = selectedPreferences ? JSON.parse(selectedPreferences) : null;
						const lastPaid = prefs?.lastPaidSelection;
						console.log("SplashScreen: Last paid selection from prefs:", lastPaid);

						if (
							lastPaid &&
							paidData.some(item =>
								item.language === lastPaid.language &&
								item.level === lastPaid.level
							)
						) {
							selectedLanguage = lastPaid.language;
							selectedLevel = lastPaid.level;
							console.log('SplashScreen: Using last paid selection from API:', lastPaid);
						} else {
							selectedLanguage = paidData[0].language;
							selectedLevel = paidData[0].level;
							console.log('SplashScreen: Using first paid course from API:', paidData[0]);
						}
					}

					// Fallback: No valid language/level
					if (!selectedLanguage || !selectedLevel) {
						console.log('SplashScreen: No valid language/level. Redirecting to LanguageSelectionScreen');
						await AsyncStorage.removeItem('selectedPreferences');
						navigation.replace('LanguageSelectionScreen');
						return;
					}

					dispatch(setLanguage(selectedLanguage));
					dispatch(setLevel(selectedLevel));

					console.log('SplashScreen: Set language:', selectedLanguage, 'level:', selectedLevel);
					console.log('SplashScreen: Navigating to MainTabs');
					navigation.replace('MainTabs');

				} else {
					console.log("SplashScreen: No token or user data, redirecting to Login");
					navigation.replace('Login');
				}
			} catch (error) {
				console.log('SplashScreen: Error checking login status', error);
				navigation.replace('Login');
			}
		};

		console.log("SplashScreen: Setting timeout for login check");
		const timer = setTimeout(checkLoginStatus, 2000);
		return () => clearTimeout(timer);
	}, [dispatch, navigation]);

	return (
		<View style={styles.container}>
			<Image source={require('../assets/image/splash.png')} style={styles.image} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	image: {
		width: 200,
		height: 200,
		resizeMode: 'contain',
	},
});

export default SplashScreen;
