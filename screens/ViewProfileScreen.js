import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, SafeAreaView, Image, ScrollView, Modal, TouchableOpacity, Alert,BackHandler } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';
import PressableButton from '../Components/PressableButton';
import profile_avatar from '../assets/image/profile_avatar.png';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

const ViewProfileScreen = ({ navigation }) => {
	const profile = useSelector(state => state.user.user);
	const [selectedAvatar, setSelectedAvatar] = useState(profile_avatar);
	const [tempSelectedAvatar, setTempSelectedAvatar] = useState(profile_avatar);
	const [modalVisible, setModalVisible] = useState(false);

	const avatars = [
		require('../assets/image/profile_avatar.png'),
		require('../assets/image/avatar1.png'),
		require('../assets/image/avatar2.png'),
		require('../assets/image/avatar3.png'),
		require('../assets/image/avatar4.png'),
		require('../assets/image/avatar5.png'),
	];

	useEffect(() => {
		loadSelectedAvatar();
	}, []);

	const loadSelectedAvatar = async () => {
		try {
			const savedAvatar = await AsyncStorage.getItem('selectedAvatar');
			if (savedAvatar) {
				const parsedAvatar = JSON.parse(savedAvatar);
				setSelectedAvatar(parsedAvatar);
				setTempSelectedAvatar(parsedAvatar);
			}
		} 
		catch (error) {
			console.log('Error loading avatar:', error);
		}
	};

	const handleAvatarSelect = (avatar) => {
		setTempSelectedAvatar(avatar);
		setModalVisible(false);
	};

	const handleEditPress = () => {
		navigation.navigate('EditProfileScreen', {
			username: profile.username,
			surename: profile.surename,
			address: profile.address,
			dateOfBirth: profile.dateOfBirth,
			phone: profile.phone,
			email: profile.email,
		});
	};

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.navigate('AccountScreen');
			return true;
		});

		return () => backHandler.remove();
	}, [navigation]);

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient
				colors={['#f9f9f9', '#fff']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<SafeAreaView style={styles.container}>
				<ScrollView>
					<View style={styles.header}>
						<View style={styles.profileContainer}>
							<Image
								source={tempSelectedAvatar}
								style={styles.avatar}
								resizeMode="cover"
							/>
						</View>
					</View>

					<Modal
						animationType="slide"
						transparent={true}
						visible={modalVisible}
						onRequestClose={() => setModalVisible(false)}
					>
						<TouchableOpacity 
							style={styles.modalOverlay}
							activeOpacity={1}
							onPress={() => setModalVisible(false)}
						>
							<View style={styles.modalContent}>
								<View style={styles.modalHeader}>
									<Text style={styles.modalTitle}>Choose Avatar</Text>
									<TouchableOpacity 
										onPress={() => setModalVisible(false)}
										style={styles.closeButton}
									>
										<Ionicons name="close" size={24} color="black" />
									</TouchableOpacity>
								</View>
								<View style={styles.avatarGrid}>
									{avatars.map((avatar, index) => (
										<TouchableOpacity
											key={index}
											style={styles.avatarOption}
											onPress={() => handleAvatarSelect(avatar)}
										>
											<Image
												source={avatar}
												style={[
													styles.avatarThumbnail,
													tempSelectedAvatar === avatar && styles.selectedAvatar
												]}
												resizeMode="cover"
											/>
										</TouchableOpacity>
									))}
								</View>
							</View>
						</TouchableOpacity>
					</Modal>

					<Text style={styles.name}>{profile.username}</Text>

					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>First Name</Text>
							<Text style={styles.readonlyText}>{profile.username}</Text>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Sure Name</Text>
							<Text style={styles.readonlyText}>{profile.surename}</Text>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>E-Mail</Text>
							<Text style={styles.readonlyText}>{profile.email || 'example@gmail.com'}</Text>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Date of Birth</Text>
							<Text style={styles.readonlyText}>{profile.dateOfBirth || 'DD/MM/YYYY'}</Text>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Phone Number</Text>
							<Text style={styles.readonlyText}>{profile.phone || '+91 9999999999'}</Text>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Address</Text>
							<Text style={[styles.readonlyText, { minHeight: 80 }]}>{profile.address || 'Type Here'}</Text>
						</View>

						<PressableButton
							style={styles.saveButton}
							title="Edit"
							onPress={handleEditPress}
						/>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8F8F8',
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
	},
	editButton: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		backgroundColor: '#8A2BE2',
		padding: 8,
		borderRadius: 20,
	},
	name: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'purple',
		marginBottom: 10,
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
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
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 20,
		width: '90%',
		maxHeight: '80%',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: 'purple',
	},
	closeButton: {
		padding: 5,
	},
	avatarGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
	},
	avatarOption: {
		width: '30%',
		aspectRatio: 1,
		marginBottom: 15,
	},
	selectedAvatar: {
		borderWidth: 3,
		borderColor: '#8A2BE2',
		transform: [{ scale: 1.1 }],
	},
	avatarThumbnail: {
		width: '100%',
		height: '100%',
		borderRadius: 50,
		borderWidth: 2,
		borderColor: '#8A2BE2',
	},
	saveButton: {
		backgroundColor: '#9346D2',
		padding: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
	},
});

export default ViewProfileScreen;
