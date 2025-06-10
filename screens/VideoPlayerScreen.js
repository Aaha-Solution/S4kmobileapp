import React, { useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet, StatusBar, Dimensions, Text } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { videoUri } = route.params;
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  // Extract video URL from the API response object
  const getVideoSource = (videoData) => {
    console.log('📹 Video data received:', videoData);
    
    // If it's already a direct URI/path (from static files)
    if (typeof videoData === 'string' || typeof videoData === 'number') {
      return videoData;
    }
    
    // If it's an API response object, extract the video URL
    if (videoData && typeof videoData === 'object') {
      // Common video URL field names in API responses
      const videoUrl = videoData.videoUrl || 
                      videoData.url || 
                      videoData.videoUri || 
                      videoData.uri || 
                      videoData.video_url ||
                      videoData.file_url ||
                      videoData.src;
      
      console.log('📹 Extracted video URL:', videoUrl);
      return videoUrl;
    }
    
    return null;
  };

  const videoSource = getVideoSource(videoUri);

  const handleLoad = (data) => {
    setLoading(false);
    setDuration(data.duration); // duration in seconds
    setError(false);
  };

  const handleBuffer = ({ isBuffering }) => {
    setLoading(isBuffering);
  };

  const handleError = (error) => {
    console.error('Video playback error:', error);
    setLoading(false);
    setError(true);
  };

  // Convert seconds to MM:SS
  const formatTime = (timeSec) => {
    const minutes = Math.floor(timeSec / 60);
    const seconds = Math.floor(timeSec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // If no valid video source found
  if (!videoSource) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Icon name="error" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>Video source not found</Text>
          <Text style={styles.errorSubText}>
            Please check the video URL or try again later
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Video Player */}
      <Video
        source={{ uri: videoSource }}
        style={styles.video}
        resizeMode="contain"
        onBuffer={handleBuffer}
        onLoad={handleLoad}
        onError={handleError}
        paused={paused}
        controls={true}
        allowsExternalPlayback={false}
        playWhenInactive={false}
        playInBackground={false}
      />

      {/* Loading indicator */}
      {loading && !error && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#9346D2" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      {/* Error state */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>Failed to load video</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setError(false);
              setLoading(true);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: '#00000080',
    borderRadius: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  errorSubText: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#9346D2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideoPlayerScreen;