import React, { useState, useEffect, useCallback } from 'react';
import {
	View, StyleSheet, Text, SafeAreaView, Image,
	ScrollView, BackHandler
} from 'react-native';
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
					if (savedAvatar) {
						setAvatarSource({ uri: JSON.parse(savedAvatar) });
					} else if (typeof selectedAvatar === 'string') {
						setAvatarSource({ uri: selectedAvatar });
					} else {
						setAvatarSource(profile_avatar);
					}
				} catch (error) {
					console.log('Error loading avatar:', error);
				}
			};
			loadSelectedAvatar();
		}, [selectedAvatar])
	);

	useEffect(() => {
		const fetchProfileUpdate = async () => {
			try {
				const token = await AsyncStorage.getItem('token');
				const response = await fetch(
					`https://smile4kids-backend.onrender.com/signup/profile?email_id=${email}&users_id=${profile.users_id}`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
					}
				);
				console.log("Profile data:", response);
				const data = await response.json();
				console.log("Profile data:", data);
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
	}, []);

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

	const formatDate = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return isNaN(date) ? 'Invalid Date' :
			date.toLocaleDateString('en-GB', {
				year: 'numeric',
				month: 'short',
				day: '2-digit',
			});
	};

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
				<SafeAreaView style={styles.container}>
					<ScrollView>
						<View style={styles.header}>
							<View style={styles.profileContainer}>
								<Image
									source={avatarSource}
									style={styles.avatar}
									resizeMode="cover"
								/>
							</View>
						</View>

						<Text style={styles.name}>{profile.username}</Text>

						<View style={styles.formContainer}>
							{[
								{ label: 'UserName', value: profile.username },
								{ label: 'E-Mail', value: email },
								{ label: 'Date of Birth', value: formatDate(profile.dateOfBirth) },
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
		color: '#666',
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
		marginTop: 10,
	},
});

export default ViewProfileScreen;
