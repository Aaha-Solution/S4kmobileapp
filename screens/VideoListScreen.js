import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Video data
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

// Language short labels
const languageLabels = {
  'Gujarati (गुजराती)': 'Gujarati',
  'Punjabi (ਪੰਜਾਬੀ)': 'Punjabi',
  'Hindi (हिन्दी)': 'Hindi',
};

const VideoListScreen = ({ navigation }) => {
  const selectedAgeGroup = useSelector(state => state.user.selectedAgeGroup);
  const selectedLanguage = useSelector(state => state.user.selectedLanguage);
  const [language, setLanguage] = useState(selectedLanguage || 'Hindi (हिन्दी)');

  const videos = videoData[language]?.[selectedAgeGroup] || [];

    useEffect(()=>{
      console.log('VideoListScreen mounted')
    })
  const handleVideoPress = (videoUri) => {
    navigation.navigate('VideoPlayer', { videoUri });
  };



  return (
    <LinearGradient colors={['#f9f9f9', '#fff']} style={styles.container}>
      
      {/* Language Buttons - Even Spaced */}
      <View style={styles.languageRow}>
        {Object.keys(languageLabels).map((langKey) => (
          <TouchableOpacity
            key={langKey}
            style={[
              styles.languageButton,
              language === langKey && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage(langKey)}
          >
            <Text style={styles.languageButtonText}>{languageLabels[langKey]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Video Grid */}
      <FlatList
        data={videos}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.videoItem} onPress={() => handleVideoPress(item)}>
            <Icon name="play-circle-fill" size={40} color="#9346D2" />
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
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  languageButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#9346D2',
  },
  languageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gridContainer: {
    padding: 10,
  },
  videoItem: {
    backgroundColor: '#d3d3d3',
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default VideoListScreen;
