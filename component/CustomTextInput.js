import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const CustomTextInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  style,
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={[styles.inputContainer, styles.shadow, style]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        placeholderTextColor="#888"
      />
      {secureTextEntry && (
        <Pressable
          style={styles.icon}
          onPress={() => setPasswordVisible(!isPasswordVisible)}
        >
          <Icon
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={isTablet ? 24 : 20}
            color="#888"
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: screenWidth * 0.85,
    maxWidth: 400,
    marginBottom: isTablet ? 20 : 15,
    position: 'relative',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    paddingVertical: isTablet ? 14 : 10,
    paddingHorizontal: isTablet ? 18 : 14,
    borderRadius: 80,
    fontSize: isTablet ? 18 : 16,
    color: '#000',
    backgroundColor: '#fff',
    paddingRight: 44, // space for eye icon
  },
  icon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
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
