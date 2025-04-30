// components/PressableButton.js
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

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
    backgroundColor: '#800080', // 🟣 Purple
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    width: '180%', // full-width button like "Apply"
    maxWidth: 100, // optional: limit size on big screens
    alignSelf: 'center', // center the button horizontally
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});

export default PressableButton;
