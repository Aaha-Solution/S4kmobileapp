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
import { login } from '../store/userSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const dispatch = useDispatch();

    const handleLogin = () => {
        if (username.trim()) {
            dispatch(login({ username })); // Assuming login expects a payload
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
                    <Text style={{ fontSize: 18, color: '#00000' }}>Email:</Text>
                    <CustomTextInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter E-mail"
                    />
                    <Text style={{ fontSize: 18, color: '#00000' }}>Password:</Text>
                    <CustomTextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter Password"
                        secureTextEntry={true}
                    />
                </View>

                <PressableButton
                    title="Login"
                    onPress={handleLogin}
                    style={{ marginTop: 10 }} // Add spacing below the inputs
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
                            <Text style={[styles.forgotText, { color: pressed ? 'white' : 'black' }]}>
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
        marginTop: -200,    // Added to move it slightly up
        resizeMode: 'contain',
    },


    background: {
        flex: 1,
        justifyContent: 'center',
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
        textAlign: 'left',       // Aligns text to the left
        alignSelf: 'flex-start', // Positions the text element to the left of its container
    },

    forgotText: {
        fontSize: 14,
        color: 'black',
    },
});

export default LoginScreen;
