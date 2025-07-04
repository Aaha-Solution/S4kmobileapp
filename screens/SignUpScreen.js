import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	StyleSheet,
	Text,
	Pressable,
	Image,
	Alert,
	ActivityIndicator,
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import { useDispatch } from 'react-redux';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
	const [username, setusername] = useState('');
	const [email, setEmail] = useState('');
	const [usernameError, setusernameError] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [emailError, setemailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');
	const [loading, setLoading] = useState(false);
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	const [isUsernameFocused, setIsUsernameFocused] = useState(false);
	const [focusedField, setFocusedField] = useState(null);
	const [usernameHelperVisible, setUsernameHelperVisible] = useState(false);
	const [passwordHelperVisible, setPasswordHelperVisible] = useState(false);
	const [confirmHelperVisible, setConfirmHelperVisible] = useState(false);
	let typingTimeoutRef = useRef(null);


	const dispatch = useDispatch();

	useEffect(() => {
		const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
		const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
		return () => {
			show.remove();
			hide.remove();
		};
	}, []);

	const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
		} else if (password.length < 6) {
			setPasswordError('Password must be at least 6 characters');
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
			const response = await fetch('https://smile4kids-backend.onrender.com/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email_id: email, password, confirm_password: confirmPassword }),
			});

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
			} else {
				if (data.errors) {
					if (data.errors.email) setemailError(data.errors.email);
					if (data.errors.username) setusernameError(data.errors.username);
					if (data.errors.password) setPasswordError(data.errors.password);
				} else {
					Alert.alert('Sign Up Failed', data.message || 'Something went wrong');
				}
			}
		} catch (error) {
			Alert.alert('Error', 'Network issue. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			style={{ flex: 1 }}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>

					{/* Sun and cloud */}
					<View style={styles.topGraphics}>
						<Image source={require('../assets/image/sun.png')} style={styles.sun} />
						<Image source={require('../assets/image/cloud.png')} style={styles.cloud} />
					</View>

					{/* Content */}
					<View style={[styles.mainContent, !keyboardVisible && { marginBottom: 80 }]}>
						<Image source={require('../assets/image/splash.png')} style={styles.logo} resizeMode="contain" />
						<Text style={styles.signupTitle}>
							<Text style={{ color: '#D2042D' }}>S</Text>
							<Text style={{ color: '#E97451' }}>I</Text>
							<Text style={{ color: '#FDDA0D' }}>G</Text>
							<Text style={{ color: '#50C878' }}>N</Text>
							<Text style={{ color: '#4169E1' }}> </Text>
							<Text style={{ color: '#9370DB' }}>U</Text>
							<Text style={{ color: '#FF1493' }}>P</Text>
						</Text>

						<View style={styles.inputContainer}>
							<CustomTextInput
								value={username}
								onChangeText={(text) => {
									const cleaned = text.replace(/[^a-z]/g, '').slice(0, 6);
									setusername(cleaned);

									setUsernameHelperVisible(true); // show helper on typing

									// Clear previous timer and start new one
									if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
									typingTimeoutRef.current = setTimeout(() => {
										setUsernameHelperVisible(false);
									}, 2000);
								}}
								onFocus={() => {
									setFocusedField('username');
									setUsernameHelperVisible(true);
								}}
								onBlur={() => {
									setFocusedField(null);
									setUsernameHelperVisible(false);
								}}
								placeholder="Username"
								maxLength={6}
								autoCapitalize="none"
							/>
							{usernameHelperVisible && (
								<View style={styles.helperCard}>
									<Text style={styles.helperText}>
										Only 6 lowercase characters allowed (a–z)
									</Text>
								</View>
							)}


							<CustomTextInput
								value={email}
								onChangeText={(text) => {
									setEmail(text);
									if (emailError) setemailError('');
								}}
								placeholder="Email"
								keyboardType="email-address"
								autoCapitalize="none"
							/>
							{emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

							<CustomTextInput
								value={password}
								onChangeText={(text) => {
									setPassword(text);
									setPasswordHelperVisible(true);
									if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
									typingTimeoutRef.current = setTimeout(() => {
										setPasswordHelperVisible(false);
									}, 2000);
								}}
								onFocus={() => {
									setFocusedField('password');
									setPasswordHelperVisible(true);
								}}
								onBlur={() => {
									setFocusedField(null);
									setPasswordHelperVisible(false);
								}}
								placeholder="Password"
								secureTextEntry
							/>
							{passwordHelperVisible && (
								<View style={styles.helperCard}>
									<Text style={styles.helperText}>
										At least 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special char
									</Text>
								</View>
							)}
							{passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}


							{/* Confirm Password */}
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
								onFocus={() => {
									setFocusedField('confirmPassword');
									setConfirmHelperVisible(true);
								}}
								onBlur={() => {
									setFocusedField(null);
									setConfirmHelperVisible(false);
								}}
								placeholder="Confirm Password"
								secureTextEntry
							/>
							{confirmHelperVisible && (
								<View style={styles.helperCard}>
									<Text style={styles.helperText}>Must match the password above</Text>
								</View>
							)}
							{confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
						</View>
						<View style={styles.buttonContainer}>
							{loading ? (
								<ActivityIndicator size="large" color="#FF8C00" />
							) : (
								<PressableButton
									title="SIGN UP"
									onPress={handleSignUp}
									style={styles.signupButton}
									textStyle={styles.signupButtonText}
								/>
							)}
						</View>
					</View>

					{/* Bottom image and login only when keyboard is hidden */}
					{!keyboardVisible && (
						<>
							<View style={styles.bottomGraphics}>
								<Image source={require('../assets/image/kids.png')} style={styles.kidsImage} />
							</View>

							<View style={styles.loginContainer}>
								<Pressable style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
									<Text style={styles.loginText}>
										Already have an account? <Text style={styles.loginLink}>Login</Text>
									</Text>
								</Pressable>
							</View>
						</>
					)}
				</LinearGradient>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container:
	{
		flex: 1
	},

	topGraphics: {
		position: 'absolute',
		top: height * 0.05,
		left: 0,
		right: 0,
		height: 80,
		zIndex: 1,
	},
	sun: {
		position: 'absolute',
		left: 20,
		top: 0,
		width: 50,
		height: 50,
		resizeMode: 'contain',
	},
	cloud: {
		position: 'absolute',
		right: 20,
		top: -10,
		width: 70,
		height: 70,
		resizeMode: 'contain',
	},
	explanationText: {
		color: 'black',
		fontSize: 12,
		marginTop: 0,
		marginBottom: 6,
		paddingLeft: 'auto',
		fontStyle: 'italic',
	},
	mainContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
		marginTop: -50,
	},
	logo: {
		width: 160,
		height: 130,
		marginBottom: 10,
	},
	signupTitle: {
		fontSize: 32,
		fontWeight: '700',
		color: '#4A90E2',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
		marginBottom: 20,
		letterSpacing: 1,
		shadowColor: '#000',
	},
	inputContainer: {
		width: '100%',
		maxWidth: 350,
	},
	errorText: {
		color: '#FF4444',
		fontSize: 12,
		marginTop: -8,
		marginBottom: 8,
		marginLeft: 15,
		fontWeight: '500',
	},
	buttonContainer: {
		marginTop: 20,
		alignItems: 'center',
	},
	signupButton: {
		backgroundColor: '#FF8C00',
		paddingVertical: 12,
		paddingHorizontal: 40,
		borderRadius: 30,
	},
	signupButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 1,
	},
	bottomGraphics: {
		position: 'absolute',
		bottom: 80,
		left: 0,
		right: 0,
		alignItems: 'center',
	},
	kidsImage: {
		width: width * 0.45,
		height: height * 0.18,
		resizeMode: 'contain',
	},
	loginContainer: {
		position: 'absolute',
		bottom: 30,
		left: 0,
		right: 0,
		alignItems: 'center',
	},
	loginButton: {
		backgroundColor: 'rgba(76, 175, 80, 0.9)',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
	},
	loginText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	loginLink: {
		textDecorationLine: 'underline',
		fontWeight: 'bold',
		color: '#FFE082',
	},
	helperCard: {
		backgroundColor: '#FFF8DC',
		borderRadius: 8,
		padding: 10,
		marginTop: 5,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#FFD700',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
	helperText: {
		color: '#333',
		fontSize: 13,
		fontWeight: '500',
	},

});

export default SignupScreen;
