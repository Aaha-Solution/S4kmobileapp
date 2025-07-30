import React, { useState, useEffect, useCallback } from 'react';
import {
	View, StyleSheet, Text, SafeAreaView, Image, BackHandler
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import profile_avatar from '../assets/image/profile_avatar.png';
import PressableButton from '../component/PressableButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { updateProfile } from '../Store/userSlice';

const ViewProfileScreen = ({ navigation }) => {
	const profile = useSelector(state => state.user.user);
	const email = useSelector(state => state.user.email) || '';
	const selectedAvatar = useSelector(state => state.user.user.selectedAvatar);
	const dispatch = useDispatch();

	const [avatarSource, setAvatarSource] = useState(profile_avatar);

	useFocusEffect(
		useCallback(() => {
			const loadSelectedAvatar = async () => {
				try {
					const savedAvatar = await AsyncStorage.getItem('selectedAvatar');
					let uri = null;
					if (savedAvatar) {
						uri = JSON.parse(savedAvatar);
					} else if (typeof selectedAvatar === 'string') {
						uri = selectedAvatar;
					}

					// ✅ Only use remote URI if it is valid
					if (uri && typeof uri === 'string' && uri.startsWith('https')) {
						setAvatarSource({ uri });
					}else {
						// 👇 Always fall back to local image
						setAvatarSource(profile_avatar);
					}
				} catch (error) {
					console.log('Error loading avatar:', error);
					setAvatarSource(profile_avatar);
				}
			};
			loadSelectedAvatar();
		}, [selectedAvatar])
	);

	useEffect(() => {
		const fetchProfileUpdate = async () => {
			try {
				if (!profile?.users_id || !email) return;
				const token = await AsyncStorage.getItem('token');
				const response = await fetch(
					`https://api.smile4kids.co.uk/signup/profile?email_id=${email}`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
					}
				);
				const data = await response.json();
				console.log("Profile data:", data);
				console.log("Fetched avatar URL:", data.avatar); // ✅ Add this line
		
				if (data?.users_id) {
					dispatch(updateProfile({
						email: data.email_id,
						username: data.username,
						address: data.address,
						dateOfBirth: data.dob,
						phone: data.ph_no,
						selectedAvatar: data.avatar,
					}));
				}
			
			} catch (error) {
				console.log("Error fetching profile:", error);
			}
		};
		

		fetchProfileUpdate();
	}, [profile?.users_id]);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.navigate('AccountScreen');
			return true;
		});
		return () => backHandler.remove();
	}, [navigation]);

	const handleEditPress = () => {
		navigation.navigate('EditProfileScreen', {
			email,
			address: profile.address,
			dateOfBirth: profile.dateOfBirth,
			username: profile.username,
			phone: profile.phone,
			selectedAvatar: profile.selectedAvatar,
		});
	};

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
				<SafeAreaView style={styles.container}>
					<ScrollView>
						<View style={styles.header}>
							<View style={styles.profileContainer}>
								{avatarSource ? (
									<Image
										source={avatarSource}
										style={styles.avatar}
										resizeMode="cover"
									/>
								) : (
									<Image
										source={require('../assets/image/profile_avatar.png')} // fallback image
										style={styles.avatar}
										resizeMode="cover"
									/>
								)}
							</View>
						</View>

						<Text style={styles.name}>{profile?.username || 'No Name'}</Text>

						<View style={styles.formContainer}>
							{[
								{ label: 'UserName', value: profile.username },
								{ label: 'E-Mail', value: email },
								{ label: 'Phone Number', value: profile.phone },
								{ label: 'Address', value: profile.address, multiline: true },
							].map((item, idx) => (
								<View style={styles.inputGroup} key={idx}>
									<Text style={styles.label}>{item.label}</Text>
									<Text style={[styles.readonlyText, item.multiline && { minHeight: 80 }]}>
										{item.value}
									</Text>
								</View>
							))}
							<PressableButton
								style={styles.saveButton}
								title="Edit"
								onPress={handleEditPress}
							/>
						</View>
					</ScrollView>
				</SafeAreaView>
			</LinearGradient>
		</View>
	);
};

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
		position: 'relative',
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 10,
		borderWidth: 2,
		borderColor: 'white',
	},
	name: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FF8C00',
		textAlign: 'center',
		marginBottom: 3,
	},
	formContainer: {
		padding: 20,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		color: 'black',
		marginBottom: 8,
	},
	readonlyText: {
		backgroundColor: '#fff',
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ddd',
		color: '#333',
	},
	saveButton: {
		padding: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: 'center',
		alignContent: 'center',
		alignSelf: 'center',
		marginTop: 20,
	},
});

export default ViewProfileScreen;
