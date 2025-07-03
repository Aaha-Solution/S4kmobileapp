import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, Text, Pressable, Image, Alert, ActivityIndicator,
    Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform,
    TouchableWithoutFeedback, Keyboard, ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { login, setProfile, setLanguage, setLevel, setPaidStatus } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { getBackendLevel } from '../utils/levelUtils';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedLevel, setselectedLevel] = useState('');
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

    useEffect(() => {
        let isMounted = true;
        const checkToken = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('token');
                const userData = await AsyncStorage.getItem('user');
                if (!token) return;
                if (token && userData) {
                    dispatch(login(JSON.parse(userData)));
                    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
                }
            } catch (error) {
                console.error('Token check error:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        checkToken();
        return () => {
            isMounted = false;
        };
    }, [navigation]);

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
            const response = await fetch('https://smile4kidsbackend-production.up.railway.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                
                },
                body: JSON.stringify({ email_id: email, password }),
            });
            console.log("response",response)

            const data = await response.json();
            await AsyncStorage.setItem('user', JSON.stringify(data.user));

            if (!response.ok) {
                Alert.alert('Login Failed', data.message || 'Invalid credentials');
                return;
            }

            await AsyncStorage.setItem('token', data.token);

            const firstPaid = data.user.paid_categories?.[0];
            const userLang = firstPaid?.language || 'English';
            const userLevel = getBackendLevel(firstPaid?.level );

            if (rememberMe) {
                await Keychain.setGenericPassword(email, password);

                setSelectedLanguage(userLang);
                setselectedLevel(userLevel);

                await AsyncStorage.setItem(
                    'selectedPreferences',
                    JSON.stringify({
                        selectedLevel: userLevel,
                        selectedLanguage: userLang,
                    })
                );
            } else {
                await Keychain.resetGenericPassword();
                await AsyncStorage.removeItem('selectedPreferences');
            }

            dispatch(login(data.user));
            dispatch(setLanguage(userLang));
            dispatch(setLevel(userLevel));

            const { paid_categories } = data.user;
            const hasValidPaidCategory =
                Array.isArray(paid_categories) &&
                paid_categories.some((item) => item.language && item.level);

            dispatch(setProfile({ paid_categories }));

            // ✅ Format and save all paid combos into Redux
            if (Array.isArray(paid_categories)) {
                const formatted = paid_categories.map(item => ({
                    language: item.language,
                    level: getBackendLevel(item.level),
                }));
                dispatch({ type: 'user/setAllPaidAccess', payload: formatted });
            }



            if (hasValidPaidCategory) {
                dispatch(setPaidStatus(true));
                console.log("✅ isPaid dispatched");

                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'MainTabs',
                            state: {
                                index: 0,
                                routes: [{ name: 'Home' }],
                            },
                        },
                    ],
                });
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'LanguageSelectionScreen' }],
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Login Credentials not found! Try again.');
        } finally {
            setLoading(false);
        }
    };


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
                                <Text style={{ color: '#D2042D' }}>L</Text>
                                <Text style={{ color: '#E97451' }}>O</Text>
                                <Text style={{ color: '#FDDA0D' }}>G</Text>
                                <Text style={{ color: '#50C878' }}>I</Text>
                                <Text style={{ color: '#4169E1' }}>N</Text>
                            </Text>
                            <CustomTextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
                            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                            <CustomTextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
                            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                            <View style={styles.buttonContainer}>
                                {loading ? (
                                    <ActivityIndicator size="large" color="#FF8C00" style={styles.loadingIndicator} />
                                ) : (
                                    <PressableButton title="LOGIN" onPress={handleLogin} style={styles.loginButton} textStyle={styles.loginButtonText} />
                                )}
                            </View>
                            <View style={styles.optionsRow}>
                                <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)}>
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
                        <Image source={require('../assets/image/kids.png')} style={styles.kidsImage} />
                        <View style={styles.signUpContainer}>
                            <Pressable style={styles.signUpButton} onPress={() => navigation.navigate('SignupScreen')}>
                                <Text style={styles.signUpText}>
                                    Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
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
        width: width * 0.6,
        height: height * 0.2,
    },
    loginTitle: {
        fontSize: RFPercentage(4.2),
        fontWeight: '700',
        marginBottom: 40,
    },
    errorText: {
        color: '#FF4444',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
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
        fontSize: RFValue(18),
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
        borderColor: '#ccc',
        borderRadius: 3,
        marginRight: 8,
    },
    checkboxChecked: {
        backgroundColor: '#FFA500',
        borderColor: '#FFA500',
    },
    optionText: {
        fontSize: 14,
        color: '#444',
    },
    forgotPasswordText: {
        color: '#770737',
        textDecorationLine: 'underline',
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
    },
});

export default LoginScreen;
