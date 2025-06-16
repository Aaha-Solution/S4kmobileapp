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
    ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import CustomAlert from '../component/CustomAlertMessage';
import { useDispatch } from 'react-redux';
import { setEmail as setReduxEmail } from '../Store/userSlice';

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

    const handleConfirmLogout = () => {
        setShowAlert(false);
    };

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
            const response = await fetch("http://192.168.0.241:3000/forgot/send-otp", {
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
                    Alert.alert("Error", data.message || "Something went wrong.");
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
                {/* <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/image/splash.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View> */}

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

            {/* Bottom Graphics */}
            <View style={styles.bottomGraphics}>
                <Image source={require('../assets/image/kids.png')} style={styles.kidsImage} />
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
                onConfirm={handleConfirmLogout}
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
    cloudContainer: {
        position: 'absolute',
        right: 20,
        top: -10,
    },
    cloud: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
    },
    
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: -80,
    },
    // logoContainer: {
    //     marginBottom: 20,
    //     alignItems: 'center',
    // },
    // logo: {
    //     width: 180,
    //     height: 50,
    // },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    emoji: {
        fontSize: 36,
        marginRight: 10,
    },
    titleText: {
        fontSize: 28,
        fontWeight: '700',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        letterSpacing: 1,
        shadowColor: '#000',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 25,
        width: '100%',
        // maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
        fontWeight: 'bold',
	
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
		alignContent:'center',
		justifyContent:'center'

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
        alignItems: 'center',
    },
    sendButton: {
        backgroundColor: '#FF8C00',
        width: '70%',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    loadingIndicator: {
        paddingVertical: 18,
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
    backToLoginContainer: {
        position: 'absolute',
        bottom: 33,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 3,
    },
    backToLoginButton: {
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
    backToLoginText: {
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

export default ForgotPasswordScreen;