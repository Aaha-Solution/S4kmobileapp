import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomTextInput = ({ value, onChangeText, placeholder, secureTextEntry = false, style }) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        placeholderTextColor="#888"
      />
      {secureTextEntry && (
        <Pressable style={styles.icon} onPress={() => setPasswordVisible(!isPasswordVisible)}>
          <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 10,
    marginBottom: 20,
    
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: '35%',
    alignItems:'center'
  },
});

export default CustomTextInput;