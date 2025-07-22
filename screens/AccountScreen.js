import React, { useState, useEffect, useCallback } from 'react';
import {
	View,
	StyleSheet,
	Text,
	Pressable,
	Image,
	BackHandler,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import profile_avatar from '../assets/image/profile_avatar.png';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
const AccountScreen = ({ route, navigation }) => {
	const selectedAvatar = useSelector((state) => state.user.user.selectedAvatar);
	const { email } = route.params || { email: 'Guest User' };
	const [name, setName] = useState(email);
	const [avatarImage, setAvatarImage] = useState(require('../assets/image/profile_avatar.png'));

	console.log("Avatar used:", avatarImage);

	useFocusEffect(
		useCallback(() => {
			const loadSelectedAvatar = async () => {
				try {
					const savedAvatar = await AsyncStorage.getItem('selectedAvatar');

					if (savedAvatar) {
						const parsed = JSON.parse(savedAvatar);

						// Validate parsed value
						if (parsed && typeof parsed === 'string' && parsed.startsWith('http')) {
							setAvatarImage({ uri: parsed });
						} else {
							setAvatarImage(profile_avatar);
						}
					} else if (selectedAvatar && typeof selectedAvatar === 'string' && selectedAvatar.startsWith('http')) {
						setAvatarImage({ uri: selectedAvatar });
					} else {
						setAvatarImage(profile_avatar);
					}
				} catch (error) {
					console.log('Error loading avatar:', error);
					setAvatarImage(profile_avatar);
				}
			};
			loadSelectedAvatar();
		}, [selectedAvatar])
	);


	const menuItems = [
		{ icon: 'person-outline', label: 'Profile', screen: 'ViewProfile', params: { email: name } },
		{ icon: 'lock-closed-outline', label: 'Change Password', screen: 'ChangePasswordScreen' },
	];

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.navigate('MainTabs', {
				screen: 'Setting',
			});
			return true;
		});

		return () => backHandler.remove();
	}, [navigation]);

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
				<ScrollView style={styles.container}>
					<View style={styles.header}>
						<View style={styles.profileContainer}>
							<Image source={avatarImage} style={styles.avatar} resizeMode="cover" />
							<Text style={styles.name}>
								<Text style={{ color: '#FF8C00' }}>My </Text>
								<Text style={{ color: 'black' }}>Account</Text>
							</Text>
						</View>
					</View>

					<ScrollView style={styles.menuContainer}>
						{menuItems.map((item, index) => (
							<Pressable
								key={index}
								style={({ pressed }) => [
									styles.menuItem,
									pressed && styles.menuItemPressed,
								]}
								onPress={() => {
									navigation.navigate(item.screen, item.params);
								}}
							>
								<View style={styles.iconLabel}>
									<Icon name={item.icon} size={22} color="black" />
									<Text style={styles.label}>{item.label}</Text>
								</View>
								<Icon name="chevron-forward" size={20} color="black" />
							</Pressable>
						))}
					</ScrollView>
				</ScrollView>
			</LinearGradient>
		</View>
	);
};

export default AccountScreen;


const styles = StyleSheet.create({
	container: {
		flex: 1,

	},
	header: {
		alignItems: 'center',
		paddingVertical: 20,
		marginTop: 110,
	},
	profileContainer: {
		alignItems: 'center',
		marginTop: 15,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: '#fff',
	},
	name: {
		color: 'Black',
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 20,

	},
	menuContainer: {
		marginTop: 10,
	},
	menuItem: {
		backgroundColor: '#fff',
		marginHorizontal: 20,
		marginBottom: 10,
		borderRadius: 12,
		padding: 15,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		elevation: 1,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
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
	editButton: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		backgroundColor: '#8A2BE2',
		padding: 8,
		borderRadius: 20,
	},
	formContainer: {
		padding: 20,
		marginTop: 20,
	},
	inputContainer: {
		marginBottom: 20,
	},
	input: {
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 12,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#E0E0E0',
	},
	saveButton: {
		backgroundColor: '#7F00FF',
		padding: 15,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 20,
	},
	saveButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
});
