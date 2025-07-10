import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	StyleSheet,
	Text,
	Image,
	Alert,
	ActivityIndicator,
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
	ScrollView,
	Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import { useDispatch } from 'react-redux';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
	const [username, setusername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [usernameError, setusernameError] = useState('');
	const [emailError, setemailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');
	const [loading, setLoading] = useState(false);
	const [keyboardVisible, setKeyboardVisible] = useState(false);
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
	const validatePassword = (pwd) =>
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwd);

	const handleSignUp = async () => {
		Keyboard.dismiss();
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
			const response = await fetch('https://smile4kidsbackend-production-159e.up.railway.app/signup', {
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

	const handlePassword = (text) => {
		setPassword(text);
		if (passwordError) setPasswordError('');
		setPasswordHelperVisible(true);
		if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
		typingTimeoutRef.current = setTimeout(() => setPasswordHelperVisible(false), 2000);
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1 }}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.topGraphics}>
							<Image source={require('../assets/image/sun.png')} style={styles.sun} />
							<Image source={require('../assets/image/cloud.png')} style={styles.cloud} />
						</View>

						<View style={styles.mainContent}>
							<Image source={require('../assets/image/splash.png')} style={styles.logo} resizeMode="contain" />

							<Text style={styles.signupTitle}>
								<Text style={{ color: '#D2042D' }}>S</Text>
								<Text style={{ color: '#E97451' }}>I</Text>
								<Text style={{ color: '#FDDA0D' }}>G</Text>
								<Text style={{ color: '#50C878' }}>N</Text>
								<Text> </Text>
								<Text style={{ color: '#9370DB' }}>U</Text>
								<Text style={{ color: '#FF1493' }}>P</Text>
							</Text>

							<View style={styles.inputContainer}>
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
								/>
								{emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

								<CustomTextInput
									value={password}
									onChangeText={handlePassword}
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

							{!keyboardVisible && (
								<View style={styles.bottomGraphics}>
									<Image source={require('../assets/image/kids.png')} style={styles.kidsImage} />
								</View>
							)}

							<View style={styles.loginContainer}>
								<Pressable style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
									<Text style={styles.loginText}>
										Already have an account? <Text style={styles.loginLink}>Login</Text>
									</Text>
								</Pressable>
							</View>
						</View>
					</ScrollView>
				</LinearGradient>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		paddingVertical: 20,
	},
	topGraphics: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		marginBottom: 10,
	},
	sun: { width: 50, height: 50, resizeMode: 'contain' },
	cloud: { width: 70, height: 70, resizeMode: 'contain' },
	mainContent: {
		width: '100%',
		alignItems: 'center',
		paddingHorizontal: '8%',
	},
	logo: {
		width: width * 0.4,
		height: width * 0.3,
		marginBottom: 10,
	},
	signupTitle: {
		fontSize: RFValue(24),
		fontWeight: 'bold',
		marginBottom: 20,
	},
	inputContainer: {
		width: '100%',
		marginBottom: 20,
	},
	errorText: {
		color: '#FF4444',
		fontSize: RFValue(11),
		marginBottom: RFValue(6),
		marginLeft: RFValue(10),
	},
	buttonContainer: {
		marginTop: 10,
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
	},
	bottomGraphics: {
		marginTop: 20,
		alignItems: 'center',
	},
	kidsImage: {
		width: width * 0.45,
		height: width * 0.25,
		resizeMode: 'contain',
	},
	loginContainer: {
		marginTop: 20,
		alignItems: 'center',
	},
	loginButton: {
		backgroundColor: 'rgba(76, 175, 80, 0.9)',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
	},
	loginText: {
		fontSize: 16,
		color: 'white',
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
		borderWidth: 1,
		borderColor: '#FFD700',
		width: '100%',
	},
	helperText: {
		color: '#333',
		fontSize: RFValue(11),
	},
});

export default SignupScreen;
