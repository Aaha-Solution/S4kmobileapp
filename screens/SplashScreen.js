import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../Store/userSlice'; // Replace with your login action

const SplashScreen = ({ navigation }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        console.log("userdata",userData)
        if (token && userData) {
          dispatch(login(JSON.parse(userData))); // Restore to Redux
          navigation.replace('MainTabs'); // Navigate to Home
        } else {
          navigation.replace('Login'); // Go to Login
        }
      } catch (error) {
        console.log('Error checking login status', error);
        navigation.replace('Login');
      }
    };

    // Show splash for 2 seconds then check
    setTimeout(() => {
      checkLoginStatus();
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/image/splash.png')} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
