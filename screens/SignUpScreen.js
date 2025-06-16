import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Pressable,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions,
    ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const dispatch = useDispatch();
    
    const handleSignUp = async () => {
        setemailError('');
        setusernameError('');
        setPasswordError('');
        setConfirmPasswordError('');
        let hasError = false;

        // Basic validation
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
            console.log("Payload:", { email, email_id: email, password, confirmPassword });
           
            const response = await fetch('http://192.168.0.209:3000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email_id: email, password, confirm_password: confirmPassword })
            });
            
            console.log("response:", response);

            const text = await response.text();
            console.log("Raw Response:", text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse JSON:", e.message);
                Alert.alert('Error', 'Invalid response from server');
                return;
            }
            console.log("Parsed Data:", data);

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
        <LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
            {/* Top Graphics */}
            <View style={styles.topGraphics}>
                <Image source={require('../assets/image/sun.png')} style={styles.sun} />
                <Image source={require('../assets/image/cloud.png')} style={styles.cloud} />
            </View>

            {/* Main Content - Scrollable */}
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.mainContent}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCurve}>
                            <Image
                                source={require('../assets/image/splash.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

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
                                setusername(text);
                                if (usernameError) setusernameError('');
                            }}
                            placeholder="Username"
                        />
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
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError('');
                            }}
                            placeholder="Password"
                            secureTextEntry={true}
                        />
                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                        <CustomTextInput
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (confirmPasswordError) setConfirmPasswordError('');
                            }}
                            placeholder="Confirm Password"
                            secureTextEntry={true}
                        />
                        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                    </View>

                    <View style={styles.buttonContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#FF8C00" style={styles.loadingIndicator} />
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
            </ScrollView>

            {/* Bottom Graphics */}
            <View style={styles.bottomGraphics}>
                <Image source={require('../assets/image/kids.png')} style={styles.kidsImage} />
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
                <Pressable style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginLink}>Login</Text>
                    </Text>
                </Pressable>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { 
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: height * 0.35, // Space for bottom graphics and login button
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: height * 0.12,
        minHeight: height * 0.65,
    },
    logoContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    logo: {
        width: 170,
        height: 140,
    },
    signupTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#4A90E2',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 30,
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
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 15,
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 350,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    signupButton: {
        backgroundColor: '#FF8C00',
        width: '65%',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    signupButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    loadingIndicator: { 
        paddingVertical: 18 
    },
    bottomGraphics: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.25,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    kidsImage: {
        position: 'absolute',
        bottom: 85,
        width: width * 0.45,
        height: height * 0.18,
        resizeMode: 'contain',
        zIndex: 2,
    },
    loginContainer: {
        position: 'absolute',
        bottom: 33,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 3,
    },
    loginButton: {
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    loginText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    loginLink: {
        textDecorationLine: 'underline',
        fontWeight: 'bold',
        color: '#FFE082',
    },
});

export default SignupScreen;