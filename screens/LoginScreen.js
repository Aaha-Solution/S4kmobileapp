import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Pressable,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { login } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkRememberedUser = async () => {
            try {
                const credentials = await Keychain.getGenericPassword();
                if (credentials) {
                    setEmail(credentials.username);
                    setPassword(credentials.password);
                    setRememberMe(true);
                }
            } catch (error) {
                console.error('Keychain error:', error);
            }
        };
        checkRememberedUser();
    }, []);

    // useEffect(() => {
    //     const checkToken = async () => {
    //         setLoading(true);
    //         try {
    //             const token = await AsyncStorage.getItem('token');
    //             if (token) {
    //                 navigation.reset({
    //                     index: 0,
    //                     routes: [{ name: 'LanguageSelectionScreen' }],
    //                 });
    //             }
    //         } catch (error) {
    //             console.error('Token check error:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     checkToken();
    // }, [navigation]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLogin = async () => {
        setEmailError('');
        setPasswordError('');
        let hasError = false;

        if (!email) {
            setEmailError('Email is required');
            hasError = true;
        } else if (!validateEmail(email)) {
            setEmailError('Enter a valid email');
            hasError = true;
        }

        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            const response = await fetch('http://192.168.0.241:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email_id: email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Login Failed', data.message || 'Invalid credentials');
                return;
            }

            await AsyncStorage.setItem('token', data.token);

            if (rememberMe) {
                await Keychain.setGenericPassword(email, password);
            } else {
                await Keychain.resetGenericPassword();
            }

            // Dispatch user data to Redux store to update application state
            dispatch(login(data.user));

            // Navigate to the LanguageSelectionScreen and reset the navigation stack
            // This prevents the user from going back to the login screen using the back button.
            navigation.reset({
                index: 0,
                routes: [{ name: 'LanguageSelectionScreen' }],
            });

        } catch (error) {
            Alert.alert('Error', 'Network issue. Try again.');
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

            {/* Main Content */}
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

                <Text style={styles.loginTitle}>
                <Text style={{ color: '#D2042D' }}>L</Text>
                <Text style={{ color: '#E97451' }}>O</Text>
                <Text style={{ color: '#FDDA0D' }}>G</Text>
                <Text style={{ color: '#50C878' }}>I</Text>
                <Text style={{ color: '#4169E1' }}>N</Text>
                </Text>

                <View>
                    <CustomTextInput
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError('');
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
                </View>

                <View style={styles.buttonContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#FF8C00" style={styles.loadingIndicator} />
                    ) : (
                        <PressableButton
                            title="LOGIN"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            textStyle={styles.loginButtonText}
                        />
                    )}
                </View>

                <View style={styles.optionsRow}>
                    <TouchableOpacity
                        style={styles.rememberMe}
                        onPress={() => setRememberMe(!rememberMe)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                            {rememberMe && <Icon name="check" size={12} color="white" />}
                        </View>
                        <Text style={styles.optionText}>Remember Me</Text>
                    </TouchableOpacity>

                    <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </Pressable>
                </View>
            </View>

            {/* Bottom Graphics */}
            <View style={styles.bottomGraphics}>
                <View style={styles.grassContainer}>
                    <View style={styles.grassLayer1} />
                    <View style={styles.grassLayer2} />
                    <View style={styles.grassLayer3} />
                </View>
                <Image source={require('../assets/image/kids.png')} style={styles.kidsImage} />
            </View>

            {/* Sign Up */}
            <View style={styles.signUpContainer}>
                <Pressable style={styles.signUpButton} onPress={() => navigation.navigate('SignupScreen')}>
                    <Text style={styles.signUpText}>
                        Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
                    </Text>
                </Pressable>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: 
    { 
        flex: 1 
    },
    topGraphics: 
    {
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
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: -height * 0.18,
    },
    logoContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 160,
    },
    loginTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#4A90E2',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 40,
        letterSpacing: 1,
        shadowColor: '#000',
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
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#FF8C00',
        width: '60%',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    loadingIndicator: { paddingVertical: 18 },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: 350,
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
        borderRadius: 3,
        marginRight: 8,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#FFA500',
        borderColor: '#FFA500',
    },
    optionText: {
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
    },
    forgotPasswordText: {
        color: '#444',
        textDecorationLine: 'underline',
        fontSize: 14,
        fontWeight: '500',
        color: '#770737',
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
 
    signUpContainer: {
        position: 'absolute',
        bottom: 33,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 3,
    },
    signUpButton: {
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
    signUpText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    signUpLink: {
        textDecorationLine: 'underline',
        fontWeight: 'bold',
        color: '#FFE082',
    },
});

export default LoginScreen;
