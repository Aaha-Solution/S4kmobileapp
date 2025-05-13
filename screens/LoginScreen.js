import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Pressable,
    ImageBackground,
    Image
} from 'react-native';
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
            const response = await fetch('http://192.168.0.241/smile4kids-Geethu/api/login.php', {
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
                // Assuming backend returns errors per field
                if (data.errors) {
                    if (data.errors.username) setUsernameError(data.errors.username);
                    if (data.errors.password) setPasswordError(data.errors.password);
                } else {
                    // Fallback for generic message
                    setUsernameError('Invalid email');
                    setPasswordError('Invalid password');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setPasswordError('Something went wrong. Please try again.');
        }
    };

    return (
        <ImageBackground
            source={require('../assets/image/gradient1.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                <Image
                    source={require('../assets/image/splash.png')}
                    style={styles.logo}
                />

                <View style={{ marginTop: -10 }}>
                    <Text style={styles.label}>Email:</Text>
                    <CustomTextInput
                        value={username}
                        onChangeText={(text) => {
                            setUsername(text);
                            if (usernameError) setUsernameError('');
                        }}
                        placeholder="Enter E-mail"
                    />
                    {usernameError ? (
                        <Text style={styles.errorText}>{usernameError}</Text>
                    ) : null}

                    <Text style={styles.label}>Password:</Text>
                    <CustomTextInput
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                        }}
                        placeholder="Enter Password"
                        secureTextEntry={true}
                    />
                    {passwordError ? (
                        <Text style={styles.errorText}>{passwordError}</Text>
                    ) : null}
                </View>

                <PressableButton
                    title="Login"
                    onPress={handleLogin}
                    style={{ marginTop: 10 }}
                />

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsRow}>
                    <View style={styles.leftOption}>
                        <Pressable
                            style={styles.rememberMe}
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    rememberMe && styles.checkboxChecked,
                                ]}
                            >
                                {rememberMe && (
                                    <Icon name="check" size={12} color="white" />
                                )}
                            </View>
                            <Text style={styles.optionText}>Remember Me</Text>
                        </Pressable>
                    </View>

                    <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                        {({ pressed }) => (
                            <Text
                                style={[
                                    styles.forgotText,
                                    { color: pressed ? 'white' : 'black' },
                                ]}
                            >
                                Forgot Password?
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        marginHorizontal: 20,
        marginTop: 80,
        borderRadius: 10,
    },
    logo: {
        width: 170,
        height: 150,
        alignSelf: 'center',
        marginTop: -200,
        resizeMode: 'contain',
    },
    background: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontSize: 18,
        color: '#000',
        marginBottom: 4,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
        marginLeft: 5,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 25,
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
        color: 'black',
        textAlign: 'left',
        alignSelf: 'flex-start',
    },
    forgotText: {
        fontSize: 14,
        color: 'black',
    },
});

export default LoginScreen;

