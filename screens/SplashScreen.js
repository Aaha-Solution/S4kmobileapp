import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { login, setLanguage, setLevel, setAllPaidAccess } from '../Store/userSlice'; // Replace with your login action

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
          const user = JSON.parse(userData);
          dispatch(login(user)); // Restore to Redux

          // Set paidAccess, selectedLanguage, and selectedLevel from paid_categories
          if (Array.isArray(user.paid_categories) && user.paid_categories.length > 0) {
            const first = user.paid_categories[0];
            dispatch(setLanguage(first.language));
            dispatch(setLevel(first.level));
            const formatted = user.paid_categories.map(item => ({
              language: item.language,
              level: item.level,
            }));
            dispatch(setAllPaidAccess(formatted));
          }

          const hasValidPaidCategory =
            Array.isArray(user.paid_categories) &&
            user.paid_categories.some(item => item.language && item.level);

          if (hasValidPaidCategory) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('LanguageSelectionScreen'); // Or your payment/selection screen
          }
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
