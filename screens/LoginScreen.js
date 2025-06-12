import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Pressable,
    Image,
    Alert,
    ActivityIndicator // Import ActivityIndicator for loading state
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { login } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain'; // Re-import Keychain for secure storage

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setemailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false); // State for loading indicator
    const dispatch = useDispatch();

    // --- Effect to check for remembered user credentials on app startup ---
    useEffect(() => {
        const checkRememberedUser = async () => {
            try {
                // Attempt to retrieve stored email and password from Keychain
                // Keychain stores these securely on the device (iOS Keychain, Android Keystore)
                const credentials = await Keychain.getGenericPassword();
                if (credentials) {
                    // If credentials are found, pre-fill the login fields
                    setEmail(credentials.username);
                    setPassword(credentials.password);
                    setRememberMe(true); // Set rememberMe switch to true
                    console.log('Remembered credentials found and pre-filled.');
                }
            } catch (error) {
                // Log any errors accessing Keychain. This often indicates a linking issue
                // or that the Keychain service is unavailable for some reason.
                console.error('Keychain could not be accessed for pre-fill:', error);
            }
        };

        checkRememberedUser();
    }, []); // Empty dependency array means this runs once on component mount

    

    // --- Function to handle the login process ---
    const handleLogin = async () => {
        // Clear any previous validation error messages
        setemailError('');
        setPasswordError('');

        // Basic client-side validation for empty fields
        if (!email) {
            setemailError('Email is required');
        }
        if (!password) {
            setPasswordError('Password is required');
        }
        if (!email || !password) {
            return; // Stop the login process if validation fails
        }

        setLoading(true); // Start loading indicator before API call
        try {
            console.log('Sending login request to API:', { email_id: email, password });
            // Make the API call to your backend login endpoint
            const response = await fetch('http://192.168.0.208:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email_id: email, password }),
            });

            const data = await response.json(); // Parse the JSON response
            console.log('Login API response received:', data);

            // Check if the API response indicates success
            if (!response.ok) {
                // If login fails (e.g., 401 Unauthorized), show an alert with the error message
                Alert.alert('Login Failed', data.message || 'Invalid credentials');
                return; // Stop execution if login was not successful
            }

            // --- Login successful ---
            // Store the session token from the API response in AsyncStorage.
            // This token is typically used for authentication of subsequent API calls.
            await AsyncStorage.setItem('token', data.token);
            console.log('Authentication token stored in AsyncStorage.');

            // --- Handle "Remember Me" logic using Keychain ---
            if (rememberMe) {
                try {
                    // If "Remember Me" is checked, securely store the user's email and password
                    // for pre-filling on future app launches.
                    await Keychain.setGenericPassword(email, password);
                    console.log('Email and password stored securely in Keychain for "Remember Me".');
                } catch (keychainSetError) {
                    // Log any errors during the Keychain set operation.
                    // This might occur if Keychain is temporarily unavailable or there's a device issue.
                    console.error('Failed to store credentials in Keychain:', keychainSetError);
                    Alert.alert('Warning', 'Could not save "Remember Me" preferences securely.');
                }
            } else {
                try {
                    // If "Remember Me" is NOT checked, remove any previously stored credentials
                    // from Keychain to ensure they are not pre-filled next time.
                    await Keychain.resetGenericPassword();
                    console.log('Remember Me not selected, clearing stored credentials (if any).');
                } catch (keychainResetError) {
                    // Log any errors during the Keychain reset operation.
                    console.error('Failed to clear credentials from Keychain:', keychainResetError);
                }
            }

            // Dispatch user data to Redux store to update application state
            if (data.user) {
                console.log('Dispatching user data to Redux store:', data.user);
            dispatch(login(data.user));
            }
            // Navigate to the LanguageSelectionScreen and reset the navigation stack
            // This prevents the user from going back to the login screen using the back button.
            navigation.reset({
                index: 0,
                routes: [{ name: 'LanguageSelectionScreen' }],
            });

        } catch (error) {
            // Catch any network errors or errors during parsing the API response
            console.error('Login request or response processing error:', error);
            Alert.alert('Error', 'Something went wrong. Please check your network and try again.');
        } finally {
            setLoading(false); // Always stop loading indicator when the process completes or errors out
        }
    };

    // --- Render the login UI ---
    return (
        <LinearGradient colors={['#9346D2', '#5BC3F5']} style={styles.background}>
            <View style={styles.container}>
                <Image
                    source={require('../assets/image/splash.png')}
                    style={styles.logo}
                />

                <CustomTextInput
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setemailError(''); // Clear email error on text change
                    }}
                    placeholder="E-mail id"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {emailError ? (
                    <Text style={styles.errorText}>{emailError}</Text>
                ) : null}

                <CustomTextInput
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError(''); // Clear password error on text change
                    }}
                    placeholder="Password"
                    secureTextEntry={true}
                />
                {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}

                {/* Show loading indicator or Login button based on 'loading' state */}
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
                ) : (
                    <PressableButton
                        title="Login"
                        onPress={handleLogin}
                        style={styles.goButton}
                    />
                )}

                {/* Remember Me and Forgot Password options row */}
                <View style={styles.bottomRow}>
                    <Pressable
                        style={styles.rememberMe}
                        onPress={() => setRememberMe(!rememberMe)} // Toggle rememberMe state on press
                    >
                        <View
                            style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                        >
                            {/* Display check icon if rememberMe is true */}
                            {rememberMe && <Icon name="check" size={12} color="white" />}
                        </View>
                        <Text style={styles.optionText}>Remember Me</Text>
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </Pressable>
                </View>

                {/* Sign Up button for new users */}
                <Pressable
                    style={styles.signupButton}
                    onPress={() => navigation.navigate('SignupScreen')}
                >
                    <Text style={styles.signupText}>
                        Don't have an account?{' '}
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </Text>
                </Pressable>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 15,
        padding: 20,
        margin: 20,
    },
    logo: {
        width: 170,
        height: 150,
        alignSelf: 'center',
        marginBottom: 30,
        resizeMode: 'contain',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
        marginLeft: 5,
    },
    goButton: {
        marginTop: 20,
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 30,
        alignSelf: 'center',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        paddingHorizontal: 5,
    },
    rememberMe: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 4,
        marginRight: 8,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#800080', // Purple color when checked
        borderColor: '#800080',
    },
    optionText: {
        fontSize: 14,
        color: '#512DA8', // Deep purple color
    },
    forgotPasswordText: {
        color: '#512DA8',
        textDecorationLine: 'underline',
        fontSize: 14,
    },
    signupButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    signupText: {
        color: 'black',
        fontSize: 14,
    },
    signupLink: {
        textDecorationLine: 'underline',
        fontWeight: 'bold',
        color: '#9346D2', // Your gradient start color
    },
    loadingIndicator: {
        marginTop: 20,
        marginBottom: 20,
    }
});

export default LoginScreen;
