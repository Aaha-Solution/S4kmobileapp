import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, Text, Pressable, Image, Alert, ActivityIndicator,
    Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform,
    TouchableWithoutFeedback, Keyboard,BackHandler
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { login, setProfile, setLanguage, setLevel, setPaidStatus, setAllPaidAccess } from '../Store/userSlice';
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

                if (!token || !userData) return;

                const user = JSON.parse(userData);
                dispatch(login(user));

                if (user.is_admin === 1) {
                    navigation.reset({ index: 0, routes: [{ name: 'AdminPannel' }] });
                } else {
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

    // Replace the handleLogin function with this fixed version

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
            const response = await fetch('http://92.205.29.164:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email_id: email, password }),
            });

            const data = await response.json();

            if (!response.ok || !data?.user) {
                Alert.alert('Login Failed', data?.message || 'Invalid credentials');
                return;
            }

            const { user, token } = data;

            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('token', token);
            console.log("🧪 is_admin:", user.is_admin);

            if (user.is_admin === 1) {
                // ✅ Admin login: redirect to AdminPanel
                dispatch(login(user));
                navigation.reset({ index: 0, routes: [{ name: 'AdminPannel' }] });
                return;
            }

            // Normal user login logic
            const firstPaid = user.paid_categories?.[0];
            const userLang = firstPaid?.language;
            const userLevel = getBackendLevel(firstPaid?.level);

            dispatch(setLanguage(userLang));
            dispatch(setLevel(userLevel));

            if (rememberMe) {
                await Keychain.setGenericPassword(email, password);
                await AsyncStorage.setItem('selectedPreferences', JSON.stringify({ selectedLanguage: userLang, selectedLevel: userLevel }));
            } else {
                await Keychain.resetGenericPassword();
                await AsyncStorage.removeItem('selectedPreferences');
            }

            const formatted = (user.paid_categories || []).map(item => ({
                language: item.language,
                level: item.level,
            }));
            dispatch(setAllPaidAccess(formatted));

            dispatch(login({
                ...user,
                language: userLang,
                level: userLevel,
            }));

            dispatch(setProfile({ paid_categories: user.paid_categories }));
            dispatch(setPaidStatus(Boolean(user.paid_categories?.length)));

            if (user.paid_categories?.length) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                });
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'LanguageSelectionScreen' }],
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            BackHandler.exitApp();
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
                                <Text style={{ color: '#D2042D' }}>L</Text>
                                <Text style={{ color: '#E97451' }}>O</Text>
                                <Text style={{ color: '#FDDA0D' }}>G</Text>
                                <Text style={{ color: '#50C878' }}>I</Text>
                                <Text style={{ color: '#4169E1' }}>N</Text>
                            </Text>
                            <CustomTextInput value={email} onChangeText={setEmail} placeholder="Email" placeholdertextcolour="#808080" keyboardType="email-address" autoCapitalize="none" />
                            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                            <CustomTextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry selectTextOnFocus={false} contextMenuHidden={true} // hides copy/paste menu
                            />
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
                        <View style={{ alignItems: 'center', width: '100%' }}>
                            <Image source={require('../assets/image/kids.png')} style={styles.kidsImage} />
                        </View>

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
        color: '#fa0202ff',
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
        fontSize: RFValue(13),
        color: '#65358c',
        fontWeight: 50
    },
    forgotPasswordText: {
        color: '#65358c',
        textDecorationLine: 'underline',
        fontWeight: 50,
        fontSize: RFValue(13),
        marginLeft: 30,
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
});

export default LoginScreen;
