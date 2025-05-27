import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Pressable,
    Image,
    Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';

const SignupScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

   
    const handleSignUp = async () => {
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Basic validation
        if (!username.trim()) {
            setUsernameError('Username is required');
            return;
        }
        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }
        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            return;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://192.168.0.241/smile4kids-Geethu/api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                navigation.navigate('LoginScreen');
            } else {
                if (data.errors) {
                    if (data.errors.username) setUsernameError(data.errors.username);
                    if (data.errors.email) setEmailError(data.errors.email);
                    if (data.errors.password) setPasswordError(data.errors.password);
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
                    placeholder="Username"
                />
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

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

                <PressableButton
                    title="Sign Up"
                    onPress={handleSignUp}
                    style={styles.signupButton}
                />

                <Pressable
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginText}>
                        Already have an account?{' '}
                        <Text style={styles.loginLink}>Login</Text>
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
        marginBottom: 10,
        resizeMode: 'contain',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
        marginLeft: 5,
    },
    signupButton: {
        marginTop: 20,
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 30,
        alignSelf: 'center',
    },
    loginButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    loginLink: {
        textDecorationLine: 'underline',
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default SignupScreen;