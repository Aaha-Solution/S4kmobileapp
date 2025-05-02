import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleSendOTP = () => {
        if (email.trim()) {
            navigation.navigate('OTPVerification', { email });
        }
    };

    return (
        <LinearGradient
          colors={['#FFDEE9', '#B5FFFC']} // Soft pastel pink to aqua
          style={styles.container}
        >
          <View style={styles.titleRow}>
            <Animated.Text
              style={[styles.emoji, { transform: [{ scale: pulseAnim }] }]}
            >
              🤔
            </Animated.Text>
            <Text style={styles.titleText}>Forgot Password?</Text>
          </View>
      
          <Text style={styles.label}>Enter your email:</Text>
          <CustomTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <PressableButton
            title="Get OTP"
            onPress={handleSendOTP}
            style={{ marginTop: 10 }}
          />
        </LinearGradient>
      );
           
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    emoji: {
      fontSize: 36,
      marginRight: 10,
    },
    titleText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#4B0082',
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#4B0082',
    },
  });
  
export default ForgotPasswordScreen;
