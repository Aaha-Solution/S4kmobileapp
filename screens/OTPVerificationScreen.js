import React, { useState, useRef,useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,BackHandler
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import PressableButton from '../component/PressableButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../component/CustomAlertMessage';
import { useDispatch } from 'react-redux';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const OTPVerificationScreen = ({ navigation }) => {
	const email = useSelector((state) => state.user.email || ''); // Get email from Redux
	const [otp, setOtp] = useState(['', '', '', '', '', '']);
	const [error, setError] = useState('');
	const [alertTitle, setAlertTitle] = useState('');
	const [alertMessage, setAlertMessage] = useState('');
	const [ showAlert, setShowAlert] = useState(false);
	const inputs = useRef([]);
	const dispatch = useDispatch();
	const handleChange = (text, index) => {
		const newOtp = [...otp];
		newOtp[index] = text;
		setOtp(newOtp);

		if (text && index < 5) {
			inputs.current[index + 1].focus();
		}
	};
	const handleConfirmExit = () => {
		setShowAlert(false)
	}

	const handleVerify = async () => {
		if (!email.trim() || otp.join('').length !== 6) {
			setError('Email and OTP are required');
			return;
		}
		try {
			const response = await fetch("https://api.smile4kids.co.uk/forgot/verify-otp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					email_id: email,
					otp: otp.join('')
				})
			});
			
			const data = await response.json();
			console.log("API response JSON:", data);

			if (data.message === 'OTP verified. You can now reset your password.') {
				Alert.alert("Success", data.message);
				navigation.navigate('ResetPasswordScreen', { email, otp: otp.join('') });
			} else {
				setAlertTitle("Invalid");
				setAlertMessage(data.message);
				setShowAlert(true);
			}
		} catch (error) {
			//console.log("OTP Verification Error:", error);
			setAlertTitle("Network Error");
			setAlertMessage("Unable to connect to server. Please try again.");
			setShowAlert(true);
		}
	};
	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.navigate('ForgotPassword');
			return true;
		});
		return () => backHandler.remove();
	}, [navigation]);

	return (
		<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={20} color="#ff8c00" />
				</Pressable>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={styles.content}
			>
				{/* Main Card */}
				<View style={styles.card}>
					{/* Fun Character/Icon */}
					<View style={styles.characterContainer}>
						<Text style={styles.character}>🐻</Text>
						<View style={styles.speechBubble}>
							<Text style={styles.speechText}>Let's verify!</Text>
						</View>
					</View>

					<Text style={styles.subtitle}>
						We sent you 6 special numbers to
					</Text>
					<Text style={styles.emailText}>{email}</Text>

					{/* OTP Input Container */}
					<View style={styles.otpContainer}>
						{otp.map((digit, index) => (
							<View key={index} style={styles.otpWrapper}>
								<TextInput
									ref={(ref) => (inputs.current[index] = ref)}
									value={digit}
									onChangeText={(text) => handleChange(text, index)}
									
									keyboardType="number-pad"
									maxLength={1}
									style={[
										styles.otpInput,
										{ backgroundColor: styles.inputColors[index] },
								
										digit && styles.otpInputFilled
									]}
									placeholderTextColor="#999"
								/>
								{digit && (
									<View style={styles.starDecoration}>
										<Text style={styles.star}>⭐</Text>
									</View>
								)}
							</View>
						))}
					</View>

					{/* Error Message */}
					{error ? (
						<View style={styles.errorContainer}>
							<Text style={styles.errorEmoji}></Text>
							<Text style={styles.errorText}>{error}</Text>
						</View>
					) : null}

					{/* Verify Button */}
					<View style={styles.buttonContainer}>
						<Pressable style={styles.verifyButton} onPress={handleVerify}>
							<LinearGradient
								colors={['#ff8c00', '#e67e00']}
								style={styles.verifyButtonGradient}
							>
								<Text style={styles.verifyButtonText}>Let's Go! 🚀</Text>
							</LinearGradient>
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>

			{/* Custom Alert */}
			<CustomAlert
				visible={showAlert}
				title={alertTitle}
				message={alertMessage}
				onConfirm={handleConfirmExit}
			/>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingTop: 50,
		paddingHorizontal: 20,
		paddingBottom: 10,
		zIndex: 1,
	},
	backButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#87CEEB',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 20,
		zIndex: 1,
	},
	card: {
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		borderRadius: 30,
		padding: 25,
		alignItems: 'center',
		shadowColor: '#FF6B9D',
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.15,
		shadowRadius: 16,
		elevation: 8,
		borderWidth: 3,
		borderColor: '#ADD8E6',
	},
	characterContainer: {
		alignItems: 'center',
		marginBottom: 15,
		position: 'relative',
	},
	character: {
		fontSize: 50,
		marginBottom: 10,
	},
	speechBubble: {
		backgroundColor: '#FFE4E1',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 15,
		borderWidth: 2,
		borderColor: '#ff8c00',
	},
	speechText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#ff8c00',
	},
	subtitle: {
		fontSize: 14,
		color: 'black',
		textAlign: 'center',
		marginBottom: 4,
		fontWeight: 'bold',
	},
	emailText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#ff8c00',
		textAlign: 'center',
		marginBottom: 15,
	},
	otpContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		alignSelf: 'center',
		width: width * 0.75,
		marginBottom: 20,
	},
	
	otpWrapper: {
		width: width * 0.11,
		alignItems: 'center',
	},
	otpInput: {
		width: width * 0.11,           // Responsive width ~ 11% of screen
		height: width * 0.13,          // Keeps shape proportional
		borderWidth: 2.5,
		borderColor: '#ADD8E6',
		borderRadius: 10,
		fontSize: width * 0.05,
		fontWeight: '700',
		textAlign: 'center',
		color: '#333',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		lineHeight: width * 0.13,
		paddingTop: 0,
		paddingBottom: 0,
		includeFontPadding: false,
	},
	
	inputColors: [
		'#FFE4E1', // Light pink
		'#E6E6FA', // Lavender  
		'#F0FFFF', // Azure
		'#F5FFFA', // Mint cream
		'#FFF8DC', // Cornsilk
		'#F0F8FF', // Alice blue
	],
	otpInputFocused: {
		borderColor: '#ff8c00',
		borderWidth: 3,
		shadowColor: '#ff8c00',
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 4,
		transform: [{ scale: 1.1 }],
	},
	otpInputFilled: {
		borderColor: '#32CD32',
		backgroundColor: '#ffffff',
	},
	starDecoration: {
		position: 'absolute',
		top: -8,
		right: -8,
	},
	star: {
		fontSize: 12,
	},
	errorContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: '#FFE4E1',
		borderRadius: 15,
		borderWidth: 2,
		borderColor: '#ff8c00',
	},
	errorEmoji: {
		fontSize: 16,
		marginRight: 6,
	},
	errorText: {
		color: '#ff8c00',
		fontSize: 12,
		fontWeight: '600',
	},
	buttonContainer: {
		width: '100%',
		marginBottom: 15,
	},
	verifyButton: {
		borderRadius: 20,
		overflow: 'hidden',
		shadowColor: '#ff8c00',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	verifyButtonGradient: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 24,
	},
	verifyButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '700',
	},
});

export default OTPVerificationScreen;