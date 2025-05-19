import React, { useEffect, useState } from 'react';
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
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/253436_tiny.mp4'),
    ],
    'Junior (7–10 years)': [
      require('../assets/videos/punjabi/junior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/junior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/junior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/junior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/junior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/junior/2386935-uhd_4096_2160_24fps.mp4'),
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

  // Get videos for the selected language and age group
  const videos = videoData[language]?.[selectedAgeGroup] || [];

  useEffect(() => {
    if (selectedLanguage) {
      setLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);

  const handleVideoPress = (videoUri) => {
    navigation.navigate('VideoPlayer', { videoUri });
  };

  const handleLanguageSelect = (langKey) => {
    setLanguage(langKey);
  };

  return (
    <LinearGradient colors={['#f9f9f9', '#fff']} style={styles.container}>
      {/* Language Buttons */}
      <View style={styles.languageRow}>
        {Object.keys(languageLabels).map((langKey) => (
          <TouchableOpacity
            key={langKey}
            style={[
              styles.languageButton,
              language === langKey && styles.languageButtonActive,
            ]}
            onPress={() => handleLanguageSelect(langKey)}
          >
            <Text style={styles.languageButtonText}>{languageLabels[langKey]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Language Header */}
      <View style={styles.languageHeader}>
        <Text style={styles.languageHeaderText}>{languageLabels[language]}</Text>
        <Text style={styles.ageGroupText}>{selectedAgeGroup}</Text>
      </View>

      {/* Video Grid */}
      <FlatList
        data={videos}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.videoItem} 
            onPress={() => handleVideoPress(item)}
          >
            <Icon name="play-circle-fill" size={40} color="#9346D2" />
            <Text style={styles.videoText}>Video {index + 1}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No videos available for this selection</Text>
          </View>
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
  languageHeader: {
    padding: 15,
    backgroundColor: '#9346D2',
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  languageHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  ageGroupText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
  },
  gridContainer: {
    padding: 10,
    flexGrow: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default VideoListScreen;
