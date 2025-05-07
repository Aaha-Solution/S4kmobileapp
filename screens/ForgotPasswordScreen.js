import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';                    
import { setEmail as setEmailRedux } from '../store/userSlice';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dispatch = useDispatch(); 

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
  }
  const handleLogin = async () => {
    if (!username || !password) {
        alert('Please enter both email and password');
        return;
    }

    try {
        const response = await fetch('http://localhost/smile4kids/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            dispatch(login(data.user)); // Save user to Redux
            navigation.navigate('LanguageSelection'); // Or your next screen
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Something went wrong. Please try again.');
    }
};
  return (
    <LinearGradient colors={['#75a0ca', '#f3b5d1']} style={styles.container}>

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
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>


          <PressableButton
            title="Get OTP"
            onPress={handleSendOTP}
            style={{ marginTop: 15 }}
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
    marginTop: -150, // Use a negative value to move it up slightly
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
    marginBottom: 8, // spacing between input+error and the next button
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },   // Increased vertical shadow
    shadowOpacity: 1,                     // Slightly more visible shadow
    shadowRadius: 8,                         // Softer edges
    elevation: 10,                           // Android elevation must be increased to match
    width: '100%',
    alignSelf: 'center',
  },

});

export default ForgotPasswordScreen;
