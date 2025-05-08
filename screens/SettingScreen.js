import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, SafeAreaView, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import profile_avatar from '../assets/image/profile_avatar.png';
import LinearGradient from 'react-native-linear-gradient';

const menuItems = [
	{ icon: 'person-outline', label: 'Account', screen: 'Account' },
	{ icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
	{ icon: 'help-circle-outline', label: 'Support', screen: 'Support' },
	{ icon: 'log-out-outline', label: 'Log out', screen: 'Log out' },
];

const SettingsScreen = ({ route, navigation }) => {
	const dispatch = useDispatch();
	const user = useSelector((state) => state.user.user);

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
					onPress: () => {
						dispatch(logout()); 
						navigation.goBack();
					},
				},
			],
			{ cancelable: false }
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient
				colors={['#f3e6db', '#f7f3ef', '#ffffff']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<SafeAreaView style={[styles.safeArea, { flex: 1 }]}> 
				<View style={styles.header}>
					<View style={styles.profileContainer}>
						<Image
							source={profile_avatar}
							style={styles.avatar}
							resizeMode="cover"
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
		marginTop: 10,
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