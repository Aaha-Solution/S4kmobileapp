import React, { useState, useEffect, useRef } from 'react';
import {
	View, StyleSheet, Text, Pressable, Image, Alert, ActivityIndicator,
	Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform,
	TouchableWithoutFeedback, Keyboard,BackHandler
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { getBackendLevel } from '../utils/levelUtils';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setemailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [username, setusername] = useState('');
	const [usernameError, setusernameError] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');
	const [usernameHelperVisible, setUsernameHelperVisible] = useState(false);
	const [passwordHelperVisible, setPasswordHelperVisible] = useState(false);
	const [confirmHelperVisible, setConfirmHelperVisible] = useState(false);

	const [isPasswordFocused, setIsPasswordFocused] = useState(false);
	const [isConfirmFocused, setIsConfirmFocused] = useState(false);
	const [isUsernameFocused, setIsUsernameFocused] = useState(false);
	const [isEmailFocused, setIsEmailFocused] = useState(false);
	
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	let typingTimeoutRef = useRef(null);

	const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	const validatePassword = (password) => {
		const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		return regex.test(password);
	};

	//  the handleLogin function to handle user login

	const handleSignUp = async () => {
		setemailError('');
		setusernameError('');
		setPasswordError('');
		setConfirmPasswordError('');
		let hasError = false;

		if (!username.trim()) {
			setusernameError('Username is required');
			hasError = true;
		}
		if (!email.trim()) {
			setemailError('Email is required');
			hasError = true;
		} else if (!validateEmail(email)) {
			setemailError('Please enter a valid email');
			hasError = true;
		}
		if (!password) {
			setPasswordError('Password is required');
			hasError = true;
		} else if (!validatePassword(password)) {
			setPasswordError('Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special char');
			hasError = true;
		}
		if (!confirmPassword) {
			setConfirmPasswordError('Please confirm your password');
			hasError = true;
		} else if (password !== confirmPassword) {
			setConfirmPasswordError('Passwords do not match');
			hasError = true;
		}

		if (hasError) return;

		setLoading(true);
		try {
			const response = await fetch('https://api.smile4kids.co.uk/signup/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username,
					email_id: email,
					password,
					confirm_password: confirmPassword
				}),
			});
			console.log("Sign Up response status:", response.status);
			const text = await response.text();
			let data;
			try {
				data = JSON.parse(text);
			} catch (e) {
				Alert.alert('Error', 'Invalid response from server');
				return;
			}

			if (data.message === 'User created successfully') {
				Alert.alert('Success', 'Account created successfully!', [
					{ text: 'OK', onPress: () => navigation.navigate('Login') }
				]);
			} else if (data.errors) {
				if (data.errors.email) setemailError(data.errors.email);
				if (data.errors.username) setusernameError(data.errors.username);
				if (data.errors.password) setPasswordError(data.errors.password);
			} else {
				// Order of checks matters here
				if (username === data.username && data.email_id === email) {
					Alert.alert('Username and Email already exist', 'Please choose a different username and email.');
				} else if (email === data.email_id) {
					Alert.alert('Email already exists', 'Please use a different email.');
				} else if (username === data.username) {
					Alert.alert('Username already exists', 'Please choose a different username.');
				} else {
					Alert.alert('Sign Up Failed', data.message || 'Something went wrong.');
				}
			}
		} catch (error) {
			Alert.alert('Error', 'Network issue. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handlePassword = (text) => {
		setPassword(text);
		if (passwordError) setPasswordError('');
		setPasswordHelperVisible(true);
		if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
		typingTimeoutRef.current = setTimeout(() => setPasswordHelperVisible(false), 2000);
	};
	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
			const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
				navigation.navigate('Login');
				return true;
			});
			return () => backHandler.remove();
		}, [navigation]);

	return (
		<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
					<ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
						<View style={styles.topGraphics}>
							<Image source={require('../assets/image/sun.png')} style={styles.sun} />
							<Image source={require('../assets/image/cloud.png')} style={styles.cloud} />
						</View>
						<View style={styles.mainContent}>
							<View style={styles.logoContainer}>
								<Image source={require('../assets/image/splash.png')} style={styles.logo} resizeMode="contain" />
							</View>
							<Text style={styles.loginTitle}>
								<Text style={{ color: '#D2042D' }}>S</Text>
								<Text style={{ color: '#E97451' }}>I</Text>
								<Text style={{ color: '#FDDA0D' }}>G</Text>
								<Text style={{ color: '#50C878' }}>N</Text>
								<Text> </Text>
								<Text style={{ color: '#9370DB' }}>U</Text>
								<Text style={{ color: '#FF1493' }}>P</Text>
							</Text>
							<CustomTextInput
								value={username}
								onChangeText={(text) => {
									const cleaned = text.replace(/[^a-z]/g, '').slice(0, 6);
									setusername(cleaned);
									setUsernameHelperVisible(true);
									if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
									typingTimeoutRef.current = setTimeout(() => {
										setUsernameHelperVisible(false);
									}, 2000);
								}}
								placeholder="Username"
								maxLength={6}
								autoCapitalize="none"
								style={{ width: '100%',alignSelf: 'center' }}
							/>
							{usernameHelperVisible && (
								<View style={styles.helperCard}>
									<Text style={styles.helperText}>Only 6 lowercase characters allowed (a–z)</Text>
								</View>
							)}
							{usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
							<CustomTextInput
								value={email}
								onChangeText={(text) => {
									setEmail(text);
									if (emailError) setemailError('');
								}}
								placeholder="Email"
								keyboardType="email-address"
								autoCapitalize="none"
								style={{ width: '100%' }}
							/>
							{emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
							<CustomTextInput
								value={password}
								onChangeText={handlePassword}
								placeholder="Password"
								secureTextEntry
								style={{ width: '100%' }}
								selectTextOnFocus={false} contextMenuHidden={true}
							/>
							{passwordHelperVisible && (
								<View style={styles.helperCard}>
									<Text style={styles.helperText}>
										At least 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special char
									</Text>
								</View>
							)}
							{passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
							<CustomTextInput
								value={confirmPassword}
								onChangeText={(text) => {
									setConfirmPassword(text);
									setConfirmHelperVisible(true);
									if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
									typingTimeoutRef.current = setTimeout(() => {
										setConfirmHelperVisible(false);
									}, 2000);
								}}
								placeholder="Confirm Password"
								secureTextEntry
								style={{ width: '100%' }}
								selectTextOnFocus={false} contextMenuHidden={true}
							/>
							{confirmHelperVisible && (
								<View style={styles.helperCard}>
									<Text style={styles.helperText}>Must match the password above</Text>
								</View>
							)}
							{confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
							<View style={styles.buttonContainer}>
								{loading ? (
									<ActivityIndicator size="large" color="#FF8C00" style={styles.loadingIndicator} />
								) : (
									<PressableButton
										title="SIGN UP"
										onPress={handleSignUp}
										disabled={loading}
										style={[styles.loginButton, loading && { opacity: 0.6 }]}
										textStyle={styles.loginButtonText}
									/>

								)}
							</View>
						</View>
						<View style={{ alignItems: 'center', width: '100%' }}>
							<Image source={require('../assets/image/kids.png')} style={styles.kidsImage} />
						</View>

						<View style={styles.signUpContainer}>
							<Pressable style={styles.signUpButton} onPress={() => navigation.navigate('Login')}>
								<Text style={styles.signUpText}>
									Already have an account? <Text style={styles.signUpLink}>Login</Text>
								</Text>
							</Pressable>
						</View>
					</ScrollView>
				</LinearGradient>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 16,
	},
	topGraphics: {
		position: 'absolute',
		top: Platform.OS === 'ios' ? 60 : 30,
		left: 0,
		right: 0,
		height: 80,
		zIndex: 2,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
	},
	sun: {
		width: width * 0.12,
		height: width * 0.12,
		resizeMode: 'contain',
	},
	cloud: {
		width: width * 0.18,
		height: width * 0.18,
		resizeMode: 'contain',
	},
	mainContent: {
		width: '90%',
		maxWidth: 400,
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoContainer: {
		marginBottom: 20,
	},
	logo: {
		width: width * 0.4,
		height: width * 0.3,
		marginBottom: 10,
	},
	loginTitle: {
		fontSize: RFPercentage(4.2),
		fontWeight: '700',
		marginBottom: 40,
	},
	errorText: {
		color: '#FF4444',
		fontSize: RFValue(11),            // Responsive font size
		alignSelf: 'flex-start',
		marginLeft: RFValue(20),          // Responsive left margin
		marginTop: RFValue(-6),           // Adjusted to avoid overlap
		marginBottom: RFValue(6),         // Responsive bottom spacing
	},
	buttonContainer: {
		marginBottom: 20,
	},
	loginButton: {
		backgroundColor: '#FF8C00',
		paddingVertical: 12,
		paddingHorizontal: 40,
		borderRadius: 30,

	},
	loginButtonText: {
		color: 'white',
		fontSize: RFValue(20),
		fontWeight: 'bold',
	},
	loadingIndicator: {
		paddingVertical: 18,
	},
	optionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		paddingHorizontal: 10,
	},
	rememberMe: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	checkbox: {
		width: 18,
		height: 18,
		borderWidth: 2,
		borderColor: '#65358c',
		borderRadius: 3,
		marginRight: 8,
	},
	checkboxChecked: {
		backgroundColor: '#FFA500',
		borderColor: '#FFA500',
	},
	optionText: {
		fontSize: RFValue(11),
		color: '#65358c',
		fontWeight: 50
	},
	forgotPasswordText: {
		color: '#65358c',
		textDecorationLine: 'underline',
		fontWeight: 50,
		fontSize: RFValue(11),
	},
	kidsImage: {
		width: width * 0.45,
		height: width * 0.25,
		resizeMode: 'contain',
		marginTop: 20,
	},
	signUpContainer: {
		marginTop: 8,
	},
	signUpButton: {
		backgroundColor: 'rgba(76, 175, 80, 0.9)',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
	},
	signUpText: {
		color: '#fff',
		fontSize: RFValue(13),
		textAlign: 'center',
	},
	signUpLink: {
		textDecorationLine: 'underline',
		fontWeight: 'bold',
		color: '#FFE082',
		fontSize: RFValue(15)
	},
	helperCard: {
		backgroundColor: '#FDFBD4',
		padding: 10,
		borderRadius: 8,
		marginTop: 5,
		width: '100%',
		marginBottom: 10,
	},
	helperText: {
		color: 'black', // or any contrasting color like '#000000' or '#444'
		fontSize: RFValue(11),
	},
	
});

export default SignupScreen;
