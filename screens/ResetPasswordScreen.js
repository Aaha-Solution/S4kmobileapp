import React, {useState} from 'react';
import {View, Text, StyleSheet,Pressable, Alert} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';

const ResetPasswordScreen = ({route}) => {
    const {email} = route.params;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation();

    const handleResetPassword = () =>{
        if (!newPassword.trim() || !confirmPassword.trim()){
            setError('Please fill in both password fields.')
           return;
        }
        if (newPassword !== confirmPassword){
            setError('Passwords do not match.');
            return;
        }
        setError('');
        Alert.alert('Success', 'Your password has been reset successfully!', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        };
        return (
            <LinearGradient colors={['#75a0ca', '#f3b5d1']} style={styles.container}>
              <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={28} color="#4B0082" />
                </Pressable>
              </View>
        
              <View style={styles.content}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>Enter your new password</Text>
        
                <CustomTextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New Password"
                  secureTextEntry={true}
                />
        
                <CustomTextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  secureTextEntry={true}
                />
        
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
                <PressableButton
                  title="Reset Password"
                  onPress={handleResetPassword}
                  style={{ marginTop: 20 }}
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
            alignSelf: 'flex-start',
          },
          content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
          title: {
            fontSize: 26,
            fontWeight: 'bold',
            color: '#4B0082',
            marginBottom: 10,
          },
          subtitle: {
            fontSize: 16,
            color: '#333',
            marginBottom: 30,
          },
          errorText: {
            color: 'red',
            marginTop: 10,
            fontWeight: 'bold',
          },
        });
        
        export default ResetPasswordScreen;
        