import React, {useState} from 'react';
import { View, TextInput, StyleSheet, Text, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import {login} from '../store/userSlice';
import PressableButton from '../component/PressableButton';
import CustomTextInput from '../component/CustomTextInput';
const LoginScreen = ({ navigation}) => {
 const [username, setUsername] = useState('');
 const dispatch = useDispatch ();

 const handleLogin = () => {
    if (username.trim()){
        dispatch(login)
    }
 };
 return(
    <View style={styles.container}>
     <Text style = {styles.title}>Login</Text>
     <CustomTextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter Username"
      />
    <PressableButton title="Login" onPress={handleLogin} />
    </View>
 );
};
const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      justifyContent: 'center', 
      padding: 20, 
      backgroundColor: '#fff' },
    title: { 
        fontSize: 24, 
        marginBottom: 20, 
        textAlign: 'center' ,
        justifyContent: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#aaa',
      padding: 10,
      borderRadius: 5,
      marginBottom: 15,
    },
  });
  
  export default LoginScreen;