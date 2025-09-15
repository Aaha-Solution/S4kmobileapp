import React, { useState,useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Alert,Pressable,BackHandler } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PressableButton from '../component/PressableButton';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePasswordScreen = ({ navigation }) => {
	const email = useSelector((state) => state.user.email) || '';
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isCurrentPasswordVisible, setCurrentPasswordVisible] = useState(false);
	const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

	const handleCurrentPasswordChange = (text) => {
		setCurrentPassword(text);
	};

	const handleChangePassword = async () => {
		if (!email || !currentPassword || !newPassword || !confirmPassword) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		// Password validation
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
		if (!passwordRegex.test(newPassword)) {
			Alert.alert(
				'Error',
				'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
			);
			return;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert('Error', 'New passwords do not match');
			return;
		}

		try {
			const token = await AsyncStorage.getItem('token');
			//console.log('Token:', token);
			const response = await fetch("https://api.smile4kids.co.uk/forgot/change-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,

				},
				body: JSON.stringify({
					email_id: email,
					current_password: currentPassword,
					new_password: newPassword,
					confirm_password: confirmPassword,
				}),
			});
			//console.log('Authorization Header:', token)

			if (!token) {
				Alert.alert('Error', 'No token found. Please log in again.');
				navigation.navigate('Login');
				return;
			}

			const data = await response.json();
			if(currentPassword === newPassword) {
				Alert.alert('Invalid', 'Old password and new password cannot be same.');
				return;
			}
			if (data.message === "Password changed successfully") {
				Alert.alert('Success', data.message);
				navigation.navigate("AccountScreen");
			} else {
				Alert.alert('Error', data.message || 'Something went wrong.');
				//Alert.alert('Alert','Something went wrong. Please try again later.');
			}
		} catch (error) {
		//console.error('Error changing password:', error);
			Alert.alert('Error', 'Failed to change password. Please try again later.');
		}
	};

	useEffect(() => {
			const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
				navigation.navigate('AccountScreen');
				return true;
			});
	
		});

	const handleCancel = () => {
		navigation.goBack();
	};

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
				<ScrollView style={styles.container}>
					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>E-Mail</Text>
							<TextInput
								style={[styles.input, { backgroundColor: '#eee' }]}
								value={email}
								editable={false}
								placeholderTextColor="#999"
							/>
						</View>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Current Password</Text>
							<TextInput
								style={styles.input}
								value={currentPassword}
								onChangeText={handleCurrentPasswordChange}
								placeholder="Enter current password"
								secureTextEntry={!isCurrentPasswordVisible}
								placeholderTextColor="#999"
								selectTextOnFocus={false} contextMenuHidden={true}
							/>
							<Pressable style={styles.icon} onPress={() => setCurrentPasswordVisible(!isCurrentPasswordVisible)}>
								<Icon name={isCurrentPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
							</Pressable>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>New Password</Text>
							<TextInput
								style={styles.input}
								value={newPassword}
								onChangeText={setNewPassword}
								placeholder="Enter new password"
								secureTextEntry={!isNewPasswordVisible}
								placeholderTextColor="#999"
								editable={true} // Always editable
								selectTextOnFocus={false} contextMenuHidden={true}
							/>
							<Pressable style={styles.icon} onPress={() => setNewPasswordVisible(!isNewPasswordVisible)}>
								<Icon name={isNewPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
							</Pressable>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Confirm New Password</Text>
							<TextInput
								style={styles.input}
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								placeholder="Confirm new password"
								secureTextEntry={!isConfirmPasswordVisible}
								placeholderTextColor="#999"
								editable={true} // Always editable
								selectTextOnFocus={false} contextMenuHidden={true}
							/>
							<Pressable style={styles.icon} onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}>
								<Icon name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
							</Pressable>
						</View>

						<View style={styles.buttonContainer}>
							<PressableButton
								style={styles.saveButton}
								title="Update"
								onPress={handleChangePassword}
							/>
						</View>
					</View>
				</ScrollView>
			</LinearGradient>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	formContainer: {
		padding: 20,
		marginTop: 110,
	},
	inputGroup: {
		marginBottom: 20,
		position: 'relative',
	},
	label: {
		fontSize: 16,
		color: 'black',
		marginBottom: 8,
		fontWeight: '500',
	},
	input: {
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		fontSize: 16,
		color: '#333',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1,
		shadowRadius: 1,
		elevation: 1,
	},
	icon: {
		position: 'absolute',
		right: 15,
		top: 45,
		zIndex: 1,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
		maxHeight: 80,
		paddingLeft:20,
	},
	saveButton: {
		padding: 10,
		paddingVertical: 15,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 20,
		flex: 1,
		marginRight: 10,
		alignContent: 'center',
		
	},

});

export default ChangePasswordScreen;
