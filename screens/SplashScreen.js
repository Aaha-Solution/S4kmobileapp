import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { login, setLevel } from '../Store/userSlice';

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const [token, userData, preferences] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('selectedPreferences'),
        ]);

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          dispatch(login(parsedUser)); // ✅ Restore user into Redux

          if (preferences) {
            const { selectedLevel } = JSON.parse(preferences);
            if (selectedLevel) {
              dispatch(setLevel(selectedLevel)); // ✅ Restore level into Redux
            }
          }

          navigation.replace('MainTabs'); // ✅ Go to main app
        } else {
          navigation.replace('Login'); // ❌ Not logged in
        }
      } catch (error) {
        console.log('Error checking login status', error);
        navigation.replace('Login');
      }
    };

    const timer = setTimeout(checkLoginStatus, 2000);
    return () => clearTimeout(timer);
  }, [dispatch, navigation]);

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
