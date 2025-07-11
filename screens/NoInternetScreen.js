import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NoInternetScreen = () => (
  <View style={styles.container}>
    <Icon name="wifi-off" size={50} color="red" />
    <Text style={styles.text}>No internet connection</Text>
    <Text style={styles.subText}>Please connect to the internet to use the app.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 20, fontWeight: 'bold', color: 'red', marginBottom: 10 },
  subText: { fontSize: 16, textAlign: 'center', color: 'gray' },
});

export default NoInternetScreen;
