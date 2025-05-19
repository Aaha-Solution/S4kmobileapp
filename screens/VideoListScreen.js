import React, { useEffect, useState, useCallback } from 'react';
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
      require('../assets/videos/hindi/junior/1672679-hd_1280_720_38fps.mp4'),
      require('../assets/videos/hindi/junior/1672679-hd_1280_720_38fps.mp4'),
      require('../assets/videos/hindi/junior/1672679-hd_1280_720_38fps.mp4'),
      require('../assets/videos/hindi/junior/1672679-hd_1280_720_38fps.mp4'),
      require('../assets/videos/hindi/junior/1672679-hd_1280_720_38fps.mp4'),
      require('../assets/videos/hindi/junior/1672679-hd_1280_720_38fps.mp4'),
    ],
  },
  'Punjabi (ਪੰਜਾਬੀ)': {
    'Pre-Prep (4–6 years)': [
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
      require('../assets/videos/punjabi/prejunior/2386935-uhd_4096_2160_24fps.mp4'),
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
      require('../assets/videos/gujarat/junior/3327105-hd_1920_1080_24fps.mp4'),
      require('../assets/videos/gujarat/junior/3327105-hd_1920_1080_24fps.mp4'),
      require('../assets/videos/gujarat/junior/3327105-hd_1920_1080_24fps.mp4'),
      require('../assets/videos/gujarat/junior/3327105-hd_1920_1080_24fps.mp4'),
      require('../assets/videos/gujarat/junior/3327105-hd_1920_1080_24fps.mp4'),
      require('../assets/videos/gujarat/junior/3327105-hd_1920_1080_24fps.mp4'),
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
  const [videos, setVideos] = useState([]);

  // Debug log for initial render
  useEffect(() => {
    console.log('VideoListScreen mounted');
    console.log('Initial selectedAgeGroup:', selectedAgeGroup);
    console.log('Initial selectedLanguage:', selectedLanguage);
  }, []);

  // Update videos when language or age group changes
  useEffect(() => {
    console.log('Effect triggered - Age:', selectedAgeGroup, 'Language:', language);
    
    if (selectedAgeGroup && language) {
      const newVideos = videoData[language]?.[selectedAgeGroup] || [];
      console.log('Found videos:', newVideos.length);
      setVideos(newVideos);
    } else {
      console.log('Missing required data - Age:', selectedAgeGroup, 'Language:', language);
    }
  }, [selectedAgeGroup, language]);

  // Update language when selectedLanguage changes
  useEffect(() => {
    console.log('Language changed in Redux:', selectedLanguage);
    if (selectedLanguage) {
      setLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);

  const handleVideoPress = useCallback((videoUri) => {
    navigation.navigate('VideoPlayer', { videoUri });
  }, [navigation]);

  const handleLanguageSelect = useCallback((langKey) => {
    console.log('Language selected:', langKey);
    setLanguage(langKey);
  }, []);

  // Debug render
  console.log('Rendering VideoListScreen with:', {
    selectedAgeGroup,
    language,
    videosCount: videos.length
  });

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
        <Text style={styles.ageGroupText}>{selectedAgeGroup || 'Select Age Group'}</Text>
      </View>

      {/* Video Grid */}
      <FlatList
        data={videos}
        keyExtractor={(item, index) => `video-${index}`}
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
            <Text style={styles.emptyText}>
              {selectedAgeGroup 
                ? 'No videos available for this selection'
                : 'Please select an age group'}
            </Text>
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
    paddingVertical: 10,
    width:200,
    alignSelf: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#9346D2',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
   
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
    marginTop: 0,
    alignSelf: 'center',
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
