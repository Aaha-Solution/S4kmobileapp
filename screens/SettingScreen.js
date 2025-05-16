import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, SafeAreaView, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import profile_avatar from '../assets/image/profile_avatar.png';
import avatar1 from '../assets/image/avatar1.png';
import avatar2 from '../assets/image/avatar2.png';
import avatar3 from '../assets/image/avatar3.png';
import avatar4 from '../assets/image/avatar4.png';
import avatar5 from '../assets/image/avatar5.png';
import LinearGradient from 'react-native-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const avatarMap = {
	1: avatar1,
	2: avatar2,
	3: avatar3,
	4: avatar4,
	5: avatar5
};

const menuItems = [
	{ icon: 'person-outline', label: 'Profile', screen: 'ViewProfile' },
	{ icon: 'help-circle-outline', label: 'About', screen: 'About' },
	{ icon: 'log-out-outline', label: 'Log out', screen: 'Log out' },
];
  
const SettingsScreen = ({ route, navigation }) => {
	const { selectedAvatar } = route.params || {};
	const dispatch = useDispatch();
	const user = useSelector((state) => state.user.user);
	const [tempSelectedAvatar, setTempSelectedAvatar] = useState(profile_avatar);

	useEffect(() => {
		loadAvatar();
	}, []);

	useEffect(() => {
		if (selectedAvatar) {
			setTempSelectedAvatar(selectedAvatar);
			AsyncStorage.setItem('selectedAvatar', JSON.stringify(selectedAvatar));
		}
	}, [selectedAvatar]);

	const loadAvatar = async () => {
		try {
			const savedAvatar = await AsyncStorage.getItem('selectedAvatar');
			if (savedAvatar) {
				const parsedAvatar = JSON.parse(savedAvatar);
				setTempSelectedAvatar(parsedAvatar);
			} else {
				setTempSelectedAvatar(profile_avatar);
			}
		} catch (error) {
			console.log('Error loading avatar:', error);
			setTempSelectedAvatar(profile_avatar);
		}
	};

	// Add focus listener to reload avatar when screen comes into focus
	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			loadAvatar();
		});

		return unsubscribe;
	}, [navigation]);

	const handleLogout = () => {
		Alert.alert(
			'Logout',
			'Are you sure you want to logout?',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Logout',
					onPress: async () => {
						try {
							const response = await fetch('http://192.168.0.241/smile4kids-Geethu/api/logout.php', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({ user_id: user.id }),
							});
	
							if (!response.ok) {
								throw new Error('Logout failed');
							}
	
							const result = await response.json();
							console.log('Logout success:', result);
	
							dispatch(logout());
							navigation.dispatch(
								CommonActions.reset({
									index: 0,
									routes: [{ name: 'Login' }],
								})
							);
	
						} catch (error) {
							console.error('Logout error:', error);
							Alert.alert("Logout Failed")
						}
					},
				},
			],
			{ cancelable: false }
		);
	};
	

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient
				colors={['#E0B0FF', '#ffffff']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<SafeAreaView style={[styles.safeArea, { flex: 1 }]}> 
				<View style={styles.header}>
					<View style={styles.profileContainer}>
						<Image
							source={tempSelectedAvatar}
							style={styles.avatar}
							resizeMode="cover"
							onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
						/>
						<View>
							<Text style={styles.name}>{user.firstname} {user.surename}</Text>
							<Text style={styles.email}>{user.firstname === 'Guest User' ? 'guest@example.com' : `${user.firstname}@example.com`}</Text>
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
							onPress={() => {
								if (item.label === 'Log out') {
									handleLogout();
								} else {
									navigation.navigate(item.screen);
								}
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
			</SafeAreaView>
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
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	profileContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 100,
		paddingLeft: 10,
		borderRadius: 18,
		padding: 18,
		width: '100%',
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginRight: 15,
		//borderWidth: 2,
		//borderColor: '#804FB3',
	},
	name: {
		color: '#654321',
		fontSize: 18,
		fontWeight: 'bold',
	},
	email: {
		color: '#654321',
		fontSize: 14,
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
		shadowColor: '#804FB3',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.13,
		shadowRadius: 4,
		elevation: 2,
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
	glow: {
		position: 'absolute',
		borderRadius: 100,
		zIndex: 0,
		filter: Platform.OS === 'web' ? 'blur(40px)' : undefined,
	},
});

export default SettingsScreen;