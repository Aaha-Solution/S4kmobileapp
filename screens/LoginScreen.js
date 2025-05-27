import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Pressable,
    Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { login } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const dispatch = useDispatch();

    const handleLogin = async () => {
        setUsernameError('');
        setPasswordError('');

        if (!username || !password) {
            if (!username) setUsernameError('Email is required');
            if (!password) setPasswordError('Password is required');
            return;
        }

        try {
            const response = await fetch('http://192.168.0.208/smile4kids-Geethu/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                dispatch(login(data.user));
                navigation.navigate('LanguageSelectionScreen');
            } else {
                if (data.errors) {
                    if (data.errors.username) setUsernameError(data.errors.username);
                    if (data.errors.password) setPasswordError(data.errors.password);
                } else {
                    setUsernameError('Invalid email');
                    setPasswordError('Invalid password');
                }
            }
        } catch (error) {
            setPasswordError('Something went wrong. Please try again.');
        }
    };

    return (
        <LinearGradient
            colors={['#9346D2', '#5BC3F5']}
            style={styles.background}
        >
            <View style={styles.container}>
                <Image
                    source={require('../assets/image/splash.png')}
                    style={styles.logo}
                />

                <CustomTextInput
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        if (usernameError) setUsernameError('');
                    }}
                    placeholder="E-mail id"
                />
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

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

                <PressableButton
                    title="Login"
                    onPress={handleLogin}
                    style={styles.goButton}
                />

                {/* Remember Me and Forgot Password Side by Side */}
                <View style={styles.bottomRow}>
                    <Pressable
                        style={styles.rememberMe}
                        onPress={() => setRememberMe(!rememberMe)}
                    >
                        <View
                            style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                        >
                            {rememberMe && (
                                <Icon name="check" size={12} color="white" />
                            )}
                        </View>
                        <Text style={styles.optionText}>Remember Me</Text>
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </Pressable>
                </View>

                {/* Sign Up Button */}
                <Pressable
                    style={styles.signupButton}
                    onPress={() => navigation.navigate('SignupScreen')}
                >
                    <Text style={styles.signupText}>
                        Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
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
        overflow: 'hidden',
    },
    checkboxChecked: {
        backgroundColor: '#800080',
        borderColor: '#800080',
    },
    optionText: {
        fontSize: 14,
        color: '#512DA8',
        textAlign: 'left',
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
        color: '#9346D2',
    },
});

export default LoginScreen;
