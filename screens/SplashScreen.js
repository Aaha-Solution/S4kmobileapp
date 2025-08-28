import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import {
	login,
	setLevel,
	setLanguage,
	setAllPaidAccess,
	setPaidStatus,
} from '../Store/userSlice';

const SplashScreen = ({ navigation }) => {
	const dispatch = useDispatch();

	// ✅ Moved out for clarity
	const fetchPaidCourses = async (userId, token) => {
		console.log("⏳ Fetching paid videos for user:", userId);
		try {
			const response = await fetch(`https://api.smile4kids.co.uk/payment/my-paid-videos?user_id=${userId}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`, // ✅ attach token here
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			console.log("📦 API response from /my-paid-videos:", data);

			if (Array.isArray(data)) {
				dispatch(setAllPaidAccess(data));
				dispatch(setPaidStatus(true));
				console.log("✅ Dispatched setAllPaidAccess and setPaidStatus");
				return data;
			} else {
				console.log("⚠️ Invalid data received:", data);
			}
		} catch (err) {
			console.error("❌ Error fetching paid courses:", err);
		}
		return [];
	};

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				const [token, userData, selectedPreferences] = await Promise.all([
					AsyncStorage.getItem('token'),
					AsyncStorage.getItem('user'),
					AsyncStorage.getItem('selectedPreferences'),
				]);

				if (token && userData) {
					const parsedUser = JSON.parse(userData);
					dispatch(login(parsedUser));
					console.log("parseduser", parsedUser);

					// ✅ Admin check: if true, redirect to AdminPannel
					if (parsedUser.is_admin === 1) {
						console.log('👨‍💼 Admin detected. Redirecting to AdminPannel');
						navigation.replace('AdminPannel');
						return;
					}

					// ✅ Fetch paid categories
					let selectedLanguage = null;
					let selectedLevel = null;
					const paidData = await fetchPaidCourses(parsedUser.users_id, token);

					if (Array.isArray(paidData) && paidData.length > 0) {
						dispatch(setPaidStatus(true));

						const prefs = selectedPreferences ? JSON.parse(selectedPreferences) : null;
						const lastPaid = prefs?.lastPaidSelection;

						if (
							lastPaid &&
							paidData.some(item =>
								item.language === lastPaid.language &&
								item.level === lastPaid.level
							)
						) {
							selectedLanguage = lastPaid.language;
							selectedLevel = lastPaid.level;
							console.log('✅ Using last paid selection from API:', lastPaid);
						} else {
							selectedLanguage = paidData[0].language;
							selectedLevel = paidData[0].level;
							console.log('✅ Using first paid course from API:', paidData[0]);
						}
					}

					// ✅ Fallback: No valid language/level
					if (!selectedLanguage || !selectedLevel) {
						await AsyncStorage.removeItem('selectedPreferences');
						console.log('⚠️ No valid language/level. Redirecting to LanguageSelectionScreen');
						navigation.replace('LanguageSelectionScreen');
						return;
					}

					dispatch(setLanguage(selectedLanguage));
					dispatch(setLevel(selectedLevel));

					console.log('✅ Set language:', selectedLanguage);
					console.log('✅ Set level:', selectedLevel);

					navigation.replace('MainTabs');

				} else {
					navigation.replace('Login');
				}
			} catch (error) {
				console.log('Error checking login status', error);
				navigation.replace('Login');
			}
		};

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
