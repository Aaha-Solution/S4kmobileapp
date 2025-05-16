import React, { useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';


const videoData = {
  'Hindi (हिन्दी)': {
    'Pre-Prep (4–6 years)': [
      require('../assets/videos/hindi/prejunior/253436_tiny.mp4'),
      require('../assets/videos/hindi/prejunior/253436_tiny.mp4'),
      require('../assets/videos/hindi/prejunior/253436_tiny.mp4'),
      require('../assets/videos/hindi/prejunior/253436_tiny.mp4'),
      require('../assets/videos/hindi/prejunior/253436_tiny.mp4'),
      require('../assets/videos/hindi/prejunior/253436_tiny.mp4'),
    ],
    'Junior (7–10 years)': [
      require('../assets/videos/hindi/junior/253436_tiny.mp4'),
      require('../assets/videos/hindi/junior/253436_tiny.mp4'),
      require('../assets/videos/hindi/junior/253436_tiny.mp4'),
      require('../assets/videos/hindi/junior/253436_tiny.mp4'),
      require('../assets/videos/hindi/junior/253436_tiny.mp4'),
      require('../assets/videos/hindi/junior/253436_tiny.mp4'),
    ],
  },
  'Punjabi (ਪੰਜਾਬੀ)': {
    'Pre-Prep (4–6 years)': [
        require('../assets/videos/punjabi/prejunior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/prejunior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/prejunior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/prejunior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/prejunior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/prejunior/253436_tiny.mp4'),
    ],
    'Junior (7–10 years)': [
        require('../assets/videos/punjabi/junior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/junior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/junior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/junior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/junior/253436_tiny.mp4'),
        require('../assets/videos/punjabi/junior/253436_tiny.mp4'),
    ],
  },
  'Gujarati (गुजराती)': {
    'Pre-Prep (4–6 years)': [
        require('../assets/videos/gujarat/prejunior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/prejunior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/prejunior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/prejunior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/prejunior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/prejunior/253436_tiny.mp4'),
    ],
    'Junior (7–10 years)': [
        require('../assets/videos/gujarat/junior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/junior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/junior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/junior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/junior/253436_tiny.mp4'),
        require('../assets/videos/gujarat/junior/253436_tiny.mp4'),
    ],
  },
};

const VideoListScreen = ({ navigation }) => {
  const selectedLanguage = useSelector(state => state.user.selectedLanguage);
  const selectedAgeGroup = useSelector(state => state.user.selectedAgeGroup);

  const videos = videoData[selectedLanguage]?.[selectedAgeGroup] || [];

  const handleVideoPress = (videoUri) => {
    // Navigate to video player screen later
    navigation.navigate('VideoPlayer', { videoUri });
  };

  const goToSettings = () => {
    navigation.navigate('Setting');
  };

  // Add Settings icon to header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Home',
      headerRight: () => (
        <TouchableOpacity onPress={goToSettings} style={{ marginRight: 15 }}>
          <Icon name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#9346D2',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  return (
    <LinearGradient colors={['#9346D2', '#5BC3F5']} style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.videoItem} onPress={() => handleVideoPress(item)}>
            <Icon name="play-circle-fill" size={32} color="#9346D2" />
            <Text style={styles.videoText}>Video {index + 1}</Text>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  list: {
    paddingBottom: 60,
  },
  videoItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 18,
    marginLeft: 15,
    fontWeight: '600',
  },
});

export default VideoListScreen;