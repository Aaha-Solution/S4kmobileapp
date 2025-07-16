import React from 'react';
import VideoListScreen from './VideoListScreen';
import { View, Text, StyleSheet } from 'react-native';

const LevelSelectorScreen = (props) => {
  return <VideoListScreen {...props} />;
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: '#4B0082',
    fontWeight: 'bold',
  },
});

export default LevelSelectorScreen;