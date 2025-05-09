import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import PressableButton from '../component/PressableButton';

const OTPVerificationScreen = ({ navigation }) => {
  const email = useSelector((state) => state.user.email); // Get email from Redux
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setError('');

    if (enteredOtp === '123456') {
      // Show alert without navigation logic inside
      Alert.alert('Success', 'OTP verified successfully!');

      // Delay navigation slightly to ensure alert can show
      setTimeout(() => {
        navigation.navigate('ResetPasswordScreen', { email });
      }, 500); // 500ms delay usually works well
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };
  return (
    <LinearGradient colors={['#75a0ca', '#f3b5d1']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#4B0082" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>Sent to {email}</Text>

          <View style={styles.otpContainer}>

            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpInput}
              />
            ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <PressableButton
          title="Verify "
          onPress={handleVerify}
          style={{ marginTop: 20, width: '80%', }} // Adjusting width here
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -150, // Use a negative value to move it up slightly
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 17,
    color: '#333',
    marginBottom: 30
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center horizontally
    alignItems: 'center',
    marginVertical: 20,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#4B0082',
    fontSize: 24,
    textAlign: 'center',
    width: 50,
    height: 50,
    marginHorizontal: 8, // spacing between boxes
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  
  errorText: {
    color: 'red',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default OTPVerificationScreen;
