import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	Image,
	SafeAreaView,
	Alert,
	Platform,
	BackHandler
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAlert from '../component/CustomAlertMessage';
import profile_avatar from '../assets/image/profile_avatar.png';
import LinearGradient from 'react-native-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ route, navigation }) => {
	const selectedAvatar = useSelector((state) => state.user.user.selectedAvatar);
	const email = useSelector((state) => state.user.email) || '';
	const username = useSelector((state) => state.user.user.username) || 'Guest User';
	const dispatch = useDispatch();
	const [tempSelectedAvatar, setTempSelectedAvatar] = useState(profile_avatar);
	const [showAlert, setShowAlert] = useState(false);

	// ✅ Load avatar from AsyncStorage
	const loadAvatar = async () => {
		try {
			const savedAvatar = await AsyncStorage.getItem('selectedAvatar');
			if (savedAvatar) {
				const parsed = JSON.parse(savedAvatar);
				setTempSelectedAvatar(typeof parsed === 'string' ? { uri: parsed } : parsed);
			} else {
				setTempSelectedAvatar(profile_avatar);
			}
		} catch (error) {
			console.log('Error loading avatar:', error);
			setTempSelectedAvatar(profile_avatar);
		}
	};

	useEffect(() => {
		loadAvatar();
	}, []);

	useEffect(() => {
		if (selectedAvatar) {
			setTempSelectedAvatar(selectedAvatar);
			AsyncStorage.setItem('selectedAvatar', JSON.stringify(selectedAvatar));
		}
	}, [selectedAvatar]);

	// ✅ Reload avatar when screen comes into focus
	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', loadAvatar);
		return unsubscribe;
	}, [navigation]);

	// ✅ Confirm logout and reset state/storage
	const handleConfirmLogout = async () => {
		try {
			await AsyncStorage.multiRemove([
				'token',
				'savedEmail',
				'savedPassword',
				'user',
				'userProfile',
				'selectedAvatar',
				'selectedPreferences',
			]);
			await AsyncStorage.setItem('rememberMe', 'false');

			dispatch(logout());
			navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [{ name: 'Login' }],
				})
			);
		} catch (error) {
			console.error('Logout failed:', error);
			setShowAlert(false);
		}
	};

	const handleLogout = () => {
		setShowAlert(true);
	};

	const handleCancelLogout = () => {
		setShowAlert(false);
	};

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.navigate('Home');
			return true;
		});
		return () => backHandler.remove();
	}, [navigation]);

	const menuItems = [
		{ icon: 'person-outline', label: 'Account', screen: 'AccountScreen' },
		{ icon: 'log-out-outline', label: 'Log out', screen: 'Log out' },
	];

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
				<SafeAreaView style={styles.safeArea}>
					<View style={styles.header}>
						<View style={styles.profileContainer}>
							<Image
								source={
									typeof selectedAvatar === 'string'
										? { uri: selectedAvatar }
										: selectedAvatar || profile_avatar
								}
								style={styles.avatar}
								resizeMode="cover"
								onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
							/>

							<View>
								<Text style={styles.name}>{username}</Text>
								<Text style={styles.email}>{email}</Text>
							</View>
						</View>
					</View>

					<ScrollView style={styles.menuContainer}>
						{menuItems.map((item, index) => (
							<Pressable
								key={index}
								style={({ pressed }) => [
									styles.menuItem,
									pressed && styles.menuItemPressed
								]}
								onPress={() =>
									item.label === 'Log out'
										? handleLogout()
										: navigation.navigate(item.screen)
								}
							>
								<View style={styles.iconLabel}>
									<Icon name={item.icon} size={22} color="black" />
									<Text style={styles.label}>{item.label}</Text>
								</View>
								<Icon name="chevron-forward" size={20} color="black" />
							</Pressable>
						))}
					</ScrollView>

					<CustomAlert
						visible={showAlert}
						title="Logout"
						message="Are you sure you want to logout?"
						onConfirm={handleConfirmLogout}
						onCancel={handleCancelLogout}
					/>
				</SafeAreaView>
			</LinearGradient>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	header: {
		marginTop: -20,
		paddingVertical: 30,
		paddingHorizontal: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	profileContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 15,
		padding: 18,
		borderRadius: 18,
		width: '100%',
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginRight: 15,
		borderColor: 'white',
		borderWidth: 2,
	},
	name: {
		color: '#FF8C00',
		fontSize: 20,
		fontWeight: 'bold',
	},
	email: {
		color: 'Black',
		fontSize: 14,
		fontWeight:'bold',
	},
	menuContainer: {
		marginTop: 5,
	},
	menuItem: {
		backgroundColor: 'white',
		marginHorizontal: 20,
		marginBottom: 12,
		borderRadius: 14,
		padding: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		elevation: 2,
		shadowColor: '#804FB3',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.13,
		shadowRadius: 4,
	},
	menuItemPressed: {
		transform: [{ scale: 0.98 }],
		shadowOpacity: 0.22,
	},
	iconLabel: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	label: {
		marginLeft: 15,
		fontSize: 16,
		color: 'black',
	},
});

export default SettingsScreen;
