import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../Components/CustomAlertMessage';

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
			const response = await fetch ("http://192.168.0.208:3000/forgot/reset-password",{
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
				setAlertTitle("Success")
				setAlertMessage("Your Password has been reset")
				setShowAlert(true)
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
	const handleConfirmExit = ()=>{
		setShowAlert(false)
	}
	return (
		<LinearGradient colors={['#75a0ca', '#f3b5d1']} style={styles.container}>
			<View style={styles.header}>
				<Pressable onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#4B0082" />
				</Pressable>
			</View>

			<View style={styles.content}>
				<Text style={styles.title}>Reset Password</Text>
				<Text style={styles.subtitle}>Enter your new password</Text>

				<CustomTextInput
					value={newPassword}
					onChangeText={setNewPassword}
					placeholder="New Password"
					secureTextEntry={true}
				/>

				<CustomTextInput
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					placeholder="Confirm Password"
					secureTextEntry={true}
				/>

				{error ? <Text style={styles.errorText}>{error}</Text> : null}

				<PressableButton
					title="Reset Password"
					onPress={handleResetPassword}
					style={{ marginTop: 20 }}
				/>
				<CustomAlert
				visible={showAlert}
					title={alertTitle}
					message={alertMessage}
					onConfirm={handleConfirmExit}
					onCancel={()=>setShowAlert(false)}
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
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: -150, // Use a negative value to move it up slightly
	},
	title: {
		fontSize: 26,
		fontWeight: 'bold',
		color: '#4B0082',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		color: '#333',
		marginBottom: 30,
	},
	errorText: {
		color: 'red',
		marginTop: 10,
		fontWeight: 'bold',
	},
});

export default ResetPasswordScreen;
