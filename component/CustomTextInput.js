// components/CustomTextInput.js
import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

const CustomTextInput = ({ value, onChangeText, placeholder, secureTextEntry = false, style }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#888"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: 350,
    padding: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
    backgroundColor: '#fff',
  },
});

export default CustomTextInput;
