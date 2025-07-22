import React from 'react';
import { Pressable, Text, StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const PressableButton = ({ title, onPress, style }) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF8C00',
    paddingVertical: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 32 : 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: isTablet ? 220 : 160,
    alignSelf: 'center',
  },
  text: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});

export default PressableButton;
