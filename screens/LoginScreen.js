import React, {useState} from 'react';
import { View, TextInput, StyleSheet, Text, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import {login} from '../store/userSlice';

const LoginScreen = ({ navigation}) => {
 const [username, setUsername] = useState('');
 const dispatch = useDispatch ();

 const handleLogin = () => {
    if (username.trim()){
        dispatch(login)
    }
 };
};