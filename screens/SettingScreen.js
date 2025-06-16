import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, SafeAreaView, Alert, Platform, BackHandler } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAlert from '../component/CustomAlertMessage';
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
	{ icon: 'person-outline', label: 'Account', screen: 'AccountScreen' },
	{ icon: 'log-out-outline', label: 'Log out', screen: 'Log out' },
];
  
const SettingsScreen = ({ route, navigation }) => {
	const { selectedAvatar } = route.params || {};
	const email = useSelector((state) => state.user.email) || '';
	const username = useSelector((state) => state.user.user.username) || 'Guest User';
	const dispatch = useDispatch();
	const user = useSelector((state) => state.user.user);
	const [tempSelectedAvatar, setTempSelectedAvatar] = useState(avatar4);
	const [showAlert, setShowAlert] = useState(false);

	useEffect(() => {
		loadAvatar();
	}, []);

	useEffect(() => {
		if (selectedAvatar) {
			setTempSelectedAvatar(selectedAvatar);
			console.log('Saving selectedAvatar to AsyncStorage:', selectedAvatar);
			AsyncStorage.setItem('selectedAvatar', JSON.stringify(selectedAvatar));
		}
	}, [selectedAvatar]);

	const loadAvatar = async () => {   
		try {
			// await AsyncStorage.removeItem('selectedAvatar');
			// console.log('User data removed');
			const savedAvatar = await AsyncStorage.getItem('selectedAvatar');
			if (savedAvatar) {
				const parsedAvatar = JSON.parse(savedAvatar);
				setTempSelectedAvatar(parsedAvatar);
				console.log("savedAvatar",savedAvatar)
			} else {
				console.log('No saved avatar found, using default:', profile_avatar);
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


const handleConfirmLogout = async () => {
	console.log("handleConfirmLogout called");
	const token = await AsyncStorage.getItem('token');
	const savedEmail = await AsyncStorage.getItem('savedEmail');
    const savedPassword = await AsyncStorage.getItem('savedPassword');
    const rememberMe = await AsyncStorage.getItem('rememberMe');
	
  try {

    await AsyncStorage.removeItem('token');	 
    await AsyncStorage.removeItem('savedEmail'); // if you saved email	
    await AsyncStorage.removeItem('savedPassword'); // if you saved password
    await AsyncStorage.setItem('rememberMe', 'false'); // reset remember me
	await AsyncStorage.removeItem('selectedAvatar'); // remove selected avatar
	await AsyncStorage.removeItem('user'); // remove user data
	await AsyncStorage.removeItem('userProfile'); 
	

	 console.log("token:", token);
    console.log("savedEmail:", savedEmail);
    console.log("savedPassword:", savedPassword);
    console.log("rememberMe:", rememberMe);

	 const tokenAfterRemoval = await AsyncStorage.getItem('token');
        console.log("token AFTER removal:", tokenAfterRemoval); // This should now be null


    dispatch(logout()); // clear Redux user state
	navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [{ name: 'Login' }],
			})
		);
	}  catch (error) {
    console.error('Logout failed:', error);
	setShowAlert(false);
  }
};

const handleLogout =()=>{
	setShowAlert(true);
}
	const handleCancelLogout = () => {
		setShowAlert(false);
	};

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.navigate('Home');
			return true;
		});

		
	});


	const handleCancelExit = () => {
		setShowAlert(false);
	};

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient
				colors={['#f9f9f9', '#fff']}
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
				
				<CustomAlert
					visible={showAlert}
					title="Logout"
					message="Are you sure you want to Logout?"
					onConfirm={handleConfirmLogout}
					onCancel={handleCancelLogout}
				/>
				
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
		marginTop: 15,
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