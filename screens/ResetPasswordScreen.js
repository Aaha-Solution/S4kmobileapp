import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../component/CustomAlertMessage';

const ResetPasswordScreen = ({ route }) => {
	const { email,otp } = route.params;
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [showAlert,setShowAlert]=useState(false)
	const [alertTitle,setAlertTitle]= useState('')
	const [alertMessage,setAlertMessage]=useState('')
	const navigation = useNavigation();

	const handleResetPassword = async () => {
		if (!newPassword.trim() || !confirmPassword.trim()) {
			setError('Please fill in both password fields.')
			return;
		}
		if (newPassword !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}
		if (!email.trim() || otp.length !== 6) {
		setError('Email and OTP are required');
		return;
	}

		try{
			const response = await fetch ("https://smile4kids-mobilebackend.onrender.com/forgot/reset-password",{
				method:"POST",
				headers:{
					"Content-type":"application/json"
				},
				body:JSON.stringify({
					email_id:email,
					otp:otp,
					new_password:newPassword,
					confirm_password:confirmPassword
				})

				
			})
			console.log("API response:", response);
			console.log("conform pass", confirmPassword);
			const data = await response.json();
			console.log("data:", data);

			if (data.message === 'Password reset successful') {
				console.log("success",data.message)
				navigation.navigate("Login")
				

			}else{
				console.log("error",data.message)
				setAlertTitle("Error")
				setAlertMessage("Error Occurred during process")
				setShowAlert(true)
			}
		}catch(error){
			console.log(error)
		}

	};

	
	
	return (
		<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
			<View style={styles.header}>
				<Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={28} color="#FF8C00" />
				</Pressable>
			</View>
	
			<View style={styles.content}>
				<View style={styles.titleCard}>
					<Text style={styles.title}>🔒 Reset Password</Text>
					<Text style={styles.subtitle}>Create your new secret password!</Text>
				</View>
	
				<View style={styles.inputWrapper}>
					<CustomTextInput
						value={newPassword}
						onChangeText={setNewPassword}
						placeholder="New Password"
						secureTextEntry={true}
					/>
				</View>
	
				<View style={styles.inputWrapper}>
					<CustomTextInput
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						placeholder="Confirm Password"
						secureTextEntry={true}
					/>
				</View>
	
				{error ? (
					<View style={styles.errorCard}>
						<Text style={styles.errorText}>⚠️ {error}</Text>
					</View>
				) : null}
	
				<View style={styles.buttonWrapper}>
					<PressableButton
						title="Reset Password"
						onPress={handleResetPassword}
						style={styles.resetButton}
					/>
					
				</View>
	
				<CustomAlert
					visible={showAlert}
					title={alertTitle}
					message={alertMessage}
					onConfirm={() => setShowAlert(false)}
					
				/>
			</View>
		</LinearGradient>
	);
	};
	
	const styles = StyleSheet.create({
		container: {
			flex: 1,
			paddingHorizontal: 20,
		},
		header: {
			paddingTop: 50,
			paddingBottom: 10,
			alignSelf: 'flex-start',
		},
		backButton: {
			//backgroundColor: 'rgba(255, 255, 255, 0.7)',
			borderRadius: 25,
			padding: 12,
			// shadowColor: '#32CD32',
			// shadowOffset: {
			// 	width: 0,
			// 	height: 4,
			// },
			// shadowOpacity: 0.4,
			// shadowRadius: 6,
			// elevation: 8,
			// borderWidth: 3,
			// borderColor: '#90EE90',
		},
		content: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: -120,
		},
		titleCard: {
			//backgroundColor: 'rgba(255, 255, 255, 0.5)',
			borderRadius: 35,
			padding: 30,
			marginBottom: 40,
			alignItems: 'center',
			// shadowColor: '#32CD32',
			// shadowOffset: {
			// 	width: 0,
			// 	height: 8,
			// },
			// shadowOpacity: 0.3,
			// shadowRadius: 12,
			// elevation: 10,
			// borderWidth: 4,
			// borderColor: '#90EE90',
		},
		title: {
			fontSize: 32,
			fontWeight: 'bold',
			color: '#FF8C00',
			marginBottom: 12,
			textAlign: 'center',
		},
		subtitle: {
			fontSize: 16,
			color: '#32CD32',
			textAlign: 'center',
			fontWeight: '600',
			marginBottom: 8,
			textAlign:'center'
		},
		funText: {
			fontSize: 14,
			color: '#228B22',
			textAlign: 'center',
			fontWeight: '500',
		},
		inputWrapper: {
			
			marginBottom: 20,
			alignContent:'center',
			shadowColor: '#FFD700',
			shadowOffset: {
				width: 0,
				height: 3,
			},
			shadowOpacity: 0.4,
			shadowRadius: 6,
			elevation: 5,
		},
		inputLabel: {
			fontSize: 16,
			fontWeight: 'bold',
			color: '#FF8C00',
			marginBottom: 8,
			marginLeft: 5,
		},
		buttonWrapper: {
			marginTop: 30,
			shadowColor: '#32CD32',
			shadowOffset: {
				width: 0,
				height: 6,
			},
			shadowOpacity: 0.5,
			shadowRadius: 8,
			elevation: 12,
		},
		resetButton: {
			//backgroundColor: '#32CD32',
			borderRadius: 30,
			paddingVertical: 18,
			paddingHorizontal: 40,
			borderWidth: 3,
			borderColor: '#FFD700',
		},
		decorativeElements: {
			marginTop: 25,
			alignItems: 'center',
		},
		decorativeText: {
			fontSize: 28,
			textAlign: 'center',
			marginBottom: 8,
		},
		toyText: {
			fontSize: 14,
			color: '#228B22',
			textAlign: 'center',
			fontWeight: '500',
			fontStyle: 'italic',
		},
		errorCard: {
			backgroundColor: 'rgba(255, 239, 213, 0.9)',
			borderRadius: 25,
			padding: 20,
			marginTop: 15,
			marginBottom: 15,
			borderWidth: 3,
			borderColor: '#FFD700',
			shadowColor: '#FF8C00',
			shadowOffset: {
				width: 0,
				height: 4,
			},
			shadowOpacity: 0.3,
			shadowRadius: 6,
			elevation: 6,
		},
		errorText: {
			color: '#FF6600',
			fontWeight: 'bold',
			fontSize: 16,
			textAlign: 'center',
			marginBottom: 5,
		},
		errorSubText: {
			color: '#32CD32',
			fontSize: 14,
			textAlign: 'center',
			fontWeight: '600',
		},
	});

export default ResetPasswordScreen;
