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
    width: 350,
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    paddingRight: 40, // extra space for the icon
    width: '100%', // This makes it responsive inside its container
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: '35%',
  },
});

export default CustomTextInput;
