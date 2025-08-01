import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Pressable,
    Alert,
    Image,
    Dimensions,
    BackHandler,
    ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import CustomAlert from '../component/CustomAlertMessage';
import { useDispatch } from 'react-redux';
import { setEmail as setReduxEmail } from '../Store/userSlice';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmailState] = useState('');
    const [error, setError] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Pulse animation for emoji
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Float animation for clouds
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // const handleConfirmLogout = () => {
    //     setShowAlert(false);
    // };

    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSendOTP = async () => {
        setError('');

        if (!email.trim()) {
            setError('Please enter your email.');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("https://api.smile4kids.co.uk/forgot/send-otp", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email_id: email }),
            });

            console.log("response:", response);
            const contentType = response.headers.get("Content-Type") || "";
            console.log("contentType:", contentType);

            if (contentType.includes("application/json")) {
                const data = await response.json();
                console.log("Server response:", data);
                if (response.ok) {
                    Alert.alert("Success", data.message || "OTP sent to your email.");
                    setError('');
                    dispatch(setReduxEmail(email));
                    navigation.navigate('OTPVerification');
                } else {
                    Alert.alert("Invalid", "This email is not registered. Please check or sign up.");
                    console.error("Server error:", data);
                }
            } else {
                const text = await response.text();
                console.error("Unexpected response (HTML?):", text);
                Alert.alert("Server Error", "Unexpected response from server.");
            }
        } catch (error) {
            console.error("Forgot Password Error:", error);
            Alert.alert("Network Error", "Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const cloudTranslateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.navigate('Login');
			return true;
		});
		return () => backHandler.remove();
	}, [navigation]);

    return (
        <LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
            {/* Top Graphics */}
            <View style={styles.topGraphics}>
                <Image source={require('../assets/image/sun.png')} style={styles.sun} />
                <Animated.View style={[styles.cloudContainer, { transform: [{ translateY: cloudTranslateY }] }]}>
                    <Image source={require('../assets/image/cloud.png')} style={styles.cloud} />
                </Animated.View>
            </View>


            {/* Main Content */}
            <View style={styles.mainContent}>

                <View style={styles.titleContainer}>
                    <Animated.Text
                        style={[styles.emoji, { transform: [{ scale: pulseAnim }] }]}
                    >
                        🤔
                    </Animated.Text>
                    <Text style={styles.titleText}>
                        <Text style={{ color: '#D2042D' }}>F</Text>
                        <Text style={{ color: '#E97451' }}>O</Text>
                        <Text style={{ color: '#FDDA0D' }}>R</Text>
                        <Text style={{ color: '#50C878' }}>G</Text>
                        <Text style={{ color: '#4169E1' }}>O</Text>
                        <Text style={{ color: '#9370DB' }}>T</Text>
                        <Text style={{ color: '#FF1493' }}> ?</Text>
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.subtitle}>
                        Don't worry! Enter your email and we'll send you a reset code.
                    </Text>

                    <View style={styles.inputContainer}>
                        <CustomTextInput
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmailState(text);
                                if (error) setError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            accessibilityLabel="Email Input"
                            style={{width: '100%'}}
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    </View>

                    <View style={styles.buttonContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#FF8C00" style={styles.loadingIndicator} />
                        ) : (
                            <PressableButton
                                title="SEND OTP"
                                onPress={handleSendOTP}
                                style={styles.sendButton}
                                textStyle={styles.sendButtonText}
                                accessibilityLabel="Send OTP Button"
                            />
                        )}
                    </View>
                </View>
            </View>
            {/* Back to Login */}
            <View style={styles.backToLoginContainer}>
                <Pressable
                    style={styles.backToLoginButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.backToLoginText}>
                        Remember your password? <Text style={styles.loginLink}>Login</Text>
                    </Text>
                </Pressable>
            </View>

            <CustomAlert
                visible={showAlert}
                title="Error"
                message="Please enter a valid email address"

            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topGraphics: {
        position: 'absolute',
        top: height * 0.05,
        left: 0,
        right: 0,
        height: height * 0.12,
        zIndex: 1,
    },
    sun: {
        position: 'absolute',
        left: 20,
        top: 0,
        width: width * 0.12,
        height: width * 0.12,
        resizeMode: 'contain',
    },
    cloudContainer: {
        position: 'absolute',
        right: 20,
        top: -10,
    },
    cloud: {
        width: width * 0.18,
        height: width * 0.18,
        resizeMode: 'contain',
    },

    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width * 0.05,
        marginTop: -height * 0.12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: height * 0.03,
    },
    emoji: {
        fontSize: RFPercentage(4.0),
        marginRight: 10,
    },
    titleText: {
        fontSize: RFPercentage(4),
        fontWeight: '700',
        letterSpacing: 1,
        shadowColor: '#000',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: width * 0.06,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        alignItems: 'center',
    },
    subtitle: {
        fontSize: RFPercentage(2.2),
        color: 'black',
        textAlign: 'center',
        marginBottom: height * 0.03,
        fontWeight: 'bold',
        lineHeight: RFPercentage(3.2),
    },
    inputContainer: {
        width: '100%',
        marginBottom: height * 0.025,
        alignItems: 'center',
        alignSelf: 'center',
        maxWidth: width * 0.9 > 400 ? 400 : width * 0.9, // max 400px or 90% of screen
    },
    errorText: {
        color: '#FF4444',
        fontSize: RFPercentage(1.6),
        marginTop: height * -0.015,
        marginBottom: height * 0.015,
        marginLeft: width * 0.01,
        fontWeight: '500',
        alignSelf: 'flex-start',
        maxWidth: '95%',
    },

    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    sendButton: {
        backgroundColor: '#FF8C00',
        width: '70%',
        paddingVertical: height * 0.018,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 5,
    },
    sendButtonText: {
        color: 'white',
        fontSize: RFPercentage(2.2),
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    loadingIndicator: {
        paddingVertical: 18,
    },
    backToLoginContainer: {
        position: 'absolute',
        bottom: height * 0.05,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 3,
    },
    backToLoginButton: {
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        paddingVertical: height * 0.016,
        paddingHorizontal: width * 0.08,
        borderRadius: 25,
        elevation: 3,
    },
    backToLoginText: {
        color: '#fff',
        fontSize: RFPercentage(2),
        textAlign: 'center',
        fontWeight: '600',
    },
    loginLink: {
        textDecorationLine: 'underline',
        fontWeight: 'bold',
        color: '#FFE082',
    },
});

export default ForgotPasswordScreen;