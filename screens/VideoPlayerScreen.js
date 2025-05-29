import React, { useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet, StatusBar,  Dimensions } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';


const { width } = Dimensions.get('window');
const VideoPlayerScreen = ({ route, navigation }) => {
  const { videoUri } = route.params;
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  const handleLoad = () => setLoading(false);
  const handleBuffer = ({ isBuffering }) => setLoading(isBuffering);

  const onLoad = (data) => {
		setDuration(data.duration); // duration in seconds
	  };
	
	  // Convert seconds to MM:SS
	  const formatTime = (timeSec) => {
		const minutes = Math.floor(timeSec / 60);
		const seconds = Math.floor(timeSec % 60);
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	  };


  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Video
        source={videoUri}
        style={styles.video}
        resizeMode="contain"
        onBuffer={handleBuffer}
        onLoad={handleLoad}
        paused={paused}
        controls={true}
      />

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#9346D2" />
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
  backButton: {
    position: 'absolute',
    top: 40, // adjust based on your device/status bar
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: '#00000080',
    borderRadius: 20,
  },
});

export default VideoPlayerScreen;
