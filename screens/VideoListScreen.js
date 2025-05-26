import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Video data
const videoData = {
  'Hindi': {
    'Pre-Prep (4-6 years)': [
      require('../assets/videos/hindi/prejunior/hindiprejun.mp4'),
      require('../assets/videos/hindi/prejunior/hindiprejun.mp4'),
      require('../assets/videos/hindi/prejunior/hindiprejun.mp4'),
      require('../assets/videos/hindi/prejunior/hindiprejun.mp4'),
      require('../assets/videos/hindi/prejunior/hindiprejun.mp4'),
      require('../assets/videos/hindi/prejunior/hindiprejun.mp4'),
    ],
    'Junior (7&above years)': [
      require('../assets/videos/hindi/junior/hindijun.mp4'),
      require('../assets/videos/hindi/junior/hindijun.mp4'),
      require('../assets/videos/hindi/junior/hindijun.mp4'),
      require('../assets/videos/hindi/junior/hindijun.mp4'),
      require('../assets/videos/hindi/junior/hindijun.mp4'),
      require('../assets/videos/hindi/junior/hindijun.mp4'),
    ],
  },
  'Panjabi': {
    'Pre-Prep (4-6 years)': [
      require('../assets/videos/punjabi/prejunior/punbajprejun.mp4'),
      require('../assets/videos/punjabi/prejunior/punbajprejun.mp4'),
      require('../assets/videos/punjabi/prejunior/punbajprejun.mp4'),
      require('../assets/videos/punjabi/prejunior/punbajprejun.mp4'),
      require('../assets/videos/punjabi/prejunior/punbajprejun.mp4'),
      require('../assets/videos/punjabi/prejunior/punbajprejun.mp4'),
    ],
    'Junior (7&above years)': [
      require('../assets/videos/punjabi/junior/punjabjun.mp4'),
      require('../assets/videos/punjabi/junior/punjabjun.mp4'),
      require('../assets/videos/punjabi/junior/punjabjun.mp4'),
      require('../assets/videos/punjabi/junior/punjabjun.mp4'),
      require('../assets/videos/punjabi/junior/punjabjun.mp4'),
      require('../assets/videos/punjabi/junior/punjabjun.mp4'),
    ],
  },
  'Gujarati': {
    'Pre-Prep (4-6 years)': [
      require('../assets/videos/gujarat/prejunior/gujaratiprejun.mp4'),
      require('../assets/videos/gujarat/prejunior/gujaratiprejun.mp4'),
      require('../assets/videos/gujarat/prejunior/gujaratiprejun.mp4'),
      require('../assets/videos/gujarat/prejunior/gujaratiprejun.mp4'),
      require('../assets/videos/gujarat/prejunior/gujaratiprejun.mp4'),
      require('../assets/videos/gujarat/prejunior/gujaratiprejun.mp4'),
    ],
    'Junior (7&above years)': [
      require('../assets/videos/gujarat/junior/gujaratijun.mp4'),
      require('../assets/videos/gujarat/junior/gujaratijun.mp4'),
      require('../assets/videos/gujarat/junior/gujaratijun.mp4'),
      require('../assets/videos/gujarat/junior/gujaratijun.mp4'),
      require('../assets/videos/gujarat/junior/gujaratijun.mp4'),
      require('../assets/videos/gujarat/junior/gujaratijun.mp4'),
    ],
  },
};

// Language short labels
const languageLabels = {
  'Gujarati': 'Gujarati',
  'Panjabi': 'Panjabi',
  'Hindi': 'Hindi',
};

const VideoListScreen = ({ navigation }) => {
  const selectedAgeGroup = useSelector(state => state.user.selectedAgeGroup);
  const selectedLanguage = useSelector(state => state.user.selectedLanguage);
  const [language, setLanguage] = useState(selectedLanguage || 'Hindi');
  const [videos, setVideos] = useState([]);

  // Update videos when language or age group changes
  useEffect(() => {
    
    if (selectedAgeGroup && language) {
      const newVideos = videoData[language]?.[selectedAgeGroup] || [];
      //console.log('Setting new videos:', newVideos.length, 'for age group:', selectedAgeGroup);
      setVideos(newVideos);
    }
  }, [selectedAgeGroup, language]);

  // Update language when selectedLanguage changes
  useEffect(() => {
    if (selectedLanguage) {
      setLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);

  // Add focus listener to refresh videos when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      //console.log('Screen focused - Refreshing videos');
      if (selectedAgeGroup && language) {
        const newVideos = videoData[language]?.[selectedAgeGroup] || [];
        //console.log('Refreshing videos:', newVideos.length, 'for age group:', selectedAgeGroup);
        setVideos(newVideos);
      }
    });

    return unsubscribe;
  }, [navigation, selectedAgeGroup, language]);

  const handleVideoPress = useCallback((videoUri) => {
    navigation.navigate('VideoPlayer', { videoUri });
  }, [navigation]);

  const handleLanguageSelect = useCallback((langKey) => {
    setLanguage(langKey);
  }, []);

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
        <Text style={styles.ageGroupText}>{selectedAgeGroup ||'Select Age Group'}</Text>
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
        extraData={[selectedAgeGroup, language]}
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
