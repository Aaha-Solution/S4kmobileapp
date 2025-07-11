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
	SafeAreaView
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
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,15}$/.test(pwd);

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
			const response = await fetch('https://smile4kidsbackend-production-2970.up.railway.app/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username,
					email_id: email,
					password,
					confirm_password: confirmPassword
				}),
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
			} else if (data.errors) {
				if (data.errors.email) setemailError(data.errors.email);
				if (data.errors.username) setusernameError(data.errors.username);
				if (data.errors.password) setPasswordError(data.errors.password);
			} else {
				// Order of checks matters here
				if (username === data.username && email === data.email_id) {
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

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#F0F8FF' }}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>

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
								<View style={styles.inputWrapper}>
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
										style={{ width: '100%' }}
									/>
									{usernameHelperVisible && (
										<View style={styles.helperCard}>
											<Text style={styles.helperText}>Only 6 lowercase characters allowed (a–z)</Text>
										</View>
									)}
									{usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
								</View>
								<View style={styles.inputWrapper}>
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
								</View>
								<View style={styles.inputWrapper}>
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
								</View>
								<View style={styles.inputWrapper}>
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

						</LinearGradient>
					</ScrollView>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		paddingVertical: 20,
		paddingBottom: 40, // Add breathing room at bottom
		marginTop: Platform.OS === 'ios' ? 0 : -20, // Adjust for Android status bar
	},
	topGraphics: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		marginBottom: 10,
		marginTop: 60
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
		paddingHorizontal: '5%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	errorText: {
		color: '#FF4444',
		fontSize: RFValue(11),
		width: '100%',              // Ensures full width
		marginTop: RFValue(-6),
		marginBottom: RFValue(6),
		paddingLeft: RFValue(10),   // Aligns with input padding
		textAlign:'left' // Aligns text to the left
	},
	inputWrapper: {
		width: '100%',
		marginBottom: RFValue(5),
		alignItems: 'center',
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
		marginBottom: 10,
	},
	kidsImage: {
		width: width * 0.45,
		height: width * 0.25,
		resizeMode: 'contain',
	},
	loginContainer: {
		marginTop: 10,
		marginBottom: 30, // Prevent overlap with notch/safe area
		alignItems: 'center',
	},
	loginButton: {
		backgroundColor: 'rgba(76, 175, 80, 0.9)',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
	},
	loginText: {
		fontSize: RFValue(13),
		color: 'white',
		textAlign: 'center'
	},
	loginLink: {
		textDecorationLine: 'underline',
		fontWeight: 'bold',
		color: '#FFE082',
	},
	helperCard: {
		backgroundColor: '#FFF8DC',
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginTop: 5,
		borderWidth: 1,
		borderColor: '#FFD700',
		width: '100%',                   // ← Match parent (same as input)
		alignSelf: 'center',             // ← Center it inside wrapper
		alignItems: 'center',
		justifyContent: 'center',
	},
	helperText: {
		color: '#333',
		fontSize: 14,
	},
});


export default SignupScreen;
