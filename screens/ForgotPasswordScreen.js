import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
import { useDispatch } from 'react-redux';
import { setEmail as setReduxEmail } from '../Store/userSlice'; // Renamed to avoid conflict

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmailState] = useState('');  // Renamed to `setEmailState` to avoid conflict
  const [error, setError] = useState('');
  const dispatch = useDispatch();
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

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendOTP = () => {
    if (!email.trim()) {
      setError('Please enter your email.');
    } else if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
    } else {
      setError('');
      dispatch(setReduxEmail(email)); // Save email in Redux
      navigation.navigate('OTPVerification'); 
    }
  };

  return (
    <LinearGradient colors={['#75a0ca', '#f3b5d1']} style={styles.container}>
      <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={28} color="#4B0082" />
                </Pressable>
              </View>
      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Animated.Text
              style={[styles.emoji, { transform: [{ scale: pulseAnim }] }]}
            >
              🤔
            </Animated.Text>
            <Text style={styles.titleText}>Forgot Password?</Text>
          </View>

          <Text style={styles.label}>Enter your email:</Text>
          <View style={styles.inputContainer}>
            <CustomTextInput
              placeholder="Email"
              value={email}
              onChangeText={text => {
                setEmailState(text);  // Update email state
                setError('');  // Clear error on input change
              }}
              keyboardType="email-address"
              accessibilityLabel="Email Input"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <PressableButton
            title="Get OTP"
            onPress={handleSendOTP}
            style={{ marginTop: 15 }}
            accessibilityLabel="Get OTP Button"
          />
        </View>
      </View>

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
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -150,
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
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 10,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignSelf: 'flex-start',
  },
});

export default ForgotPasswordScreen;

