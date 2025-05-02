import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
    <LinearGradient colors={['#ADD8E6', '#FFE4E1']} style={styles.container}>
      
      {/* Top Back Button */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#4B0082" />
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
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
          style={{ marginTop: 15 }}
        />
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
