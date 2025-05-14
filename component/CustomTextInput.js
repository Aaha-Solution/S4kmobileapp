import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Pressable, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomTextInput = ({ value, onChangeText, placeholder, secureTextEntry = false, style }) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={[styles.inputContainer, styles.shadow]}>
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
    width: 320,
    marginBottom: 15,
    position: 'relative',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    paddingRight: 40, // Space for eye icon
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: '35%',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

export default CustomTextInput;
