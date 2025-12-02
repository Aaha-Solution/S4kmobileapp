import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	Image,
	SafeAreaView,
	Alert,
	Platform,
	BackHandler
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAlert from '../component/CustomAlertMessage';
import profile_avatar from '../assets/image/profile_avatar.png';
import LinearGradient from 'react-native-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
const SettingsScreen = ({ route, navigation }) => {
	const dispatch = useDispatch();
	const selectedAvatar = useSelector((state) => state.user.user.selectedAvatar);
	const email = useSelector((state) => state.user.email) || '';
	const username = useSelector((state) => state.user.user.username) || 'Guest User';
	const [tempSelectedAvatar, setTempSelectedAvatar] = useState(profile_avatar);
	const [showAlert, setShowAlert] = useState(false);
	const [loading, setLoading] = useState(false);

	const width = Dimensions.get('window').width;
	const height = Dimensions.get('window').height;
	const resolveAvatar = (avatar) => {
		if (typeof avatar === 'string') {
		  if (avatar.startsWith('http') || avatar.startsWith('file')) {
			return { uri: avatar };
		  }
		  return profile_avatar; // fallback if it's like "1"
		} else if (avatar && typeof avatar === 'object' && avatar.uri) {
		  return avatar;
		} else {
		  return profile_avatar;
		}
	  };

	//  Load avatar from AsyncStorage
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
			//console.log('Error loading avatar:', error);
			setTempSelectedAvatar(profile_avatar);
		}
	};

	useEffect(() => {
		loadAvatar();
	}, []);

	useEffect(() => {
		if (selectedAvatar) {
		  setTempSelectedAvatar(selectedAvatar);
	  
		  // only save if it's a string or uri object
		  if (
			(typeof selectedAvatar === 'string' && selectedAvatar.startsWith('http')) ||
			(typeof selectedAvatar === 'object' && selectedAvatar.uri)
		  ) {
			AsyncStorage.setItem('selectedAvatar', JSON.stringify(selectedAvatar));
		  } else {
			AsyncStorage.removeItem('selectedAvatar'); // clean invalid old ones
		  }
		}
	  }, [selectedAvatar]);
	  

	//  Reload avatar when screen comes into focus
	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', loadAvatar);
		return unsubscribe;
	}, [navigation]);

	//  Confirm logout and reset state/storage
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
				'Set level',
				'userLevel'
			]);
			await AsyncStorage.setItem('rememberMe', 'false');
			setShowAlert(false);
			dispatch(logout());
			setTimeout(() => {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [{ name: 'Login' }],
					})
				);
			}, 100);
		} catch (error) {
			//console.error('Logout failed:', error);
			setShowAlert(false);
		}
	};

	const handleLogout = () => {
		setShowAlert(true);
	};

	const handleCancelLogout = () => {
		setShowAlert(false);
	};
	//  Handle Android back button
	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.navigate('Home');
			return true;
		});
		return () => backHandler.remove();
	}, [navigation]);

	const menuItems = [
		{ icon: 'person-outline', label: 'Account', screen: 'AccountScreen' },
		{ icon: 'document-text-outline', label: 'Privacy Policy', screen: 'Policy' },
		{ icon: 'log-out-outline', label: 'Log out', screen: 'Log out' },
	];
		//console.log('profile_avatar:', profile_avatar);
	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
				<SafeAreaView style={styles.safeArea}>
					<View style={styles.header}>
						<View style={styles.profileContainer}>
							<Image
								source={resolveAvatar(tempSelectedAvatar)}
								style={styles.avatar}
								resizeMode="cover"
								onError={(e) => {
									 setTempSelectedAvatar(profile_avatar)
								}}
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
						onConfirm={loading ? (
							<ActivityIndicator size="large" color="#FF8C00" style={styles.loadingIndicator} />
						) : (handleConfirmLogout)}
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
		color: 'black',
		fontSize: 14,
		fontWeight: 'bold',
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
	loadingIndicator: {
		paddingVertical: 18,
	},
});

export default SettingsScreen;
